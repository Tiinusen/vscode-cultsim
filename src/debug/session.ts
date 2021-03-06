/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/*
 * mockDebug.ts implements the Debug Adapter that "adapts" or translates the Debug Adapter Protocol (DAP) used by the client (e.g. VS Code)
 * into requests and events of the real "execution engine" or "debugger" (here: class CultsimRuntime).
 * When implementing your own debugger extension for VS Code, most of the work will go into the Debug Adapter.
 * Since the Debug Adapter is independent from VS Code, it can be used in any client (IDE) supporting the Debug Adapter Protocol.
 *
 * The most important class of the Debug Adapter is the CultsimSession which implements many DAP requests by talking to the CultsimRuntime.
 */

import {
    Logger, logger,
    LoggingDebugSession,
    InitializedEvent, TerminatedEvent, OutputEvent,
    Source,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { basename } from 'path-browserify';
import { Subject } from 'await-notify';
import * as vscode from 'vscode';
import { CancellationToken, DebugAdapterDescriptor, DebugAdapterDescriptorFactory, DebugAdapterInlineImplementation, DebugConfiguration, DebugConfigurationProvider, DebugSession, env, ExtensionContext, ProviderResult, Uri, workspace, WorkspaceFolder } from 'vscode';
import { delay } from '../util/helpers';
import { exec } from 'child_process';
import { platform } from 'process';
import path = require('path');


/**
 * This interface describes the mock-debug specific launch attributes
 * (which are not part of the Debug Adapter Protocol).
 * The schema for these attributes lives in the package.json of the mock-debug extension.
 * The interface should always match this schema.
 */
interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** if specified, results in a simulated compile error in launch. */
    stopOnError?: boolean;
    trace?: boolean;
    showUser?: 'show' | 'hide';
    throwError?: boolean;
}


export class CultsimSession extends LoggingDebugSession {
    public static register(context: ExtensionContext) {
        const factory = new CultsimDebugAdapterFactory();
        context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('cultsim', factory));
        const provider = new CultsimConfigurationProvider();
        context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('cultsim', provider));

    }

    private _configurationDone = new Subject();

    /**
     * Creates a new debug adapter that is used for one debug session.
     * We configure the default implementation of a debug adapter here.
     */
    public constructor() {
        super("cultsim-session-debug.log");

        // this debugger uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
    }

    /**
     * The 'initialize' request is the first request called by the frontend
     * to interrogate the features the debug adapter provides.
     */
    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsTerminateRequest = true;
        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected async terminateRequest(response: DebugProtocol.TerminateResponse, args: DebugProtocol.TerminateArguments, request?: DebugProtocol.Request) {
        await this.stopAll(false);
        this.output("Cultist Simulator was closed by debugger");
        await delay(1500);
        this.sendResponse(response);
        this.end();
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args);
        this._configurationDone.notify();
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments) {
        logger.setup(args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, false);
        await this._configurationDone.wait(1000);
        try {
            await this.run();
            this.sendResponse(response);
        } catch (e) {
            this.sendErrorResponse(response, {
                id: 666,
                format: e?.message || e,
                showUser: true
            });
        }
    }

    private async run() {
        await this.validate();
        const workspaceURI = workspace.workspaceFolders[0].uri;
        await delay(1500);

        const logURI = Uri.joinPath(workspaceURI, "..", "..", "Player.log");
        await workspace.fs.writeFile(logURI, new Uint8Array());

        this.output("Starting Cultist Simulator via Steam", "prio");
        await this.startCultistSimulator();
        await this.waitForCultistSimulatorToStart(logURI);
        this.output("Cultist Simulator has successfully started");
        this.startProblemChecker(logURI);
    }


    private async validate() {
        if (workspace.workspaceFolders.length == 0) throw new Error("no workspace open");
        if (platform != "win32" && platform != "linux") throw new Error("debugger not supported in this platform");
        const workspaceURI = workspace.workspaceFolders[0].uri;
        if (path.basename(Uri.joinPath(workspaceURI, "..").fsPath) != "mods" || path.basename(Uri.joinPath(workspaceURI, "..", "..").fsPath) != "Cultist Simulator") throw new Error("mod not located within Cultist Simulator/mods folder");

        const uri = Uri.joinPath(workspaceURI, "synopsis.json");
        try {
            await workspace.fs.stat(uri);
        } catch {
            throw new Error("missing synopsis.json file");
        }
    }

    private async startCultistSimulator(): Promise<void> {
        await env.openExternal(Uri.parse("steam://rungameid/718670"));
    }

    private stopCultistSimulator(): Promise<void> {
        const cmd = ((): string => {
            switch (platform) {
                case 'linux':
                    return 'killall CS.x86_64';
                case 'win32':
                    return 'taskkill /IM "cultistsimulator.exe" /F';
            }
        })();
        return new Promise((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else if (stderr) {
                    reject(stderr);
                } else {
                    resolve();
                }
            });
        });
    }

    private isCultistSimulatorRunning(): Promise<boolean> {
        const cmd = ((): string => {
            switch (platform) {
                case 'linux':
                    return 'pgrep CS.x86_64';
                case 'win32':
                    return 'tasklist | findstr cultistsimulator.exe';
            }
        })();
        return new Promise((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
                resolve(stdout ? true : false);
            });
        });
    }

    private async waitForCultistSimulatorToStart(logURI: Uri): Promise<void> {
        for (let i = 0; i < 20; i++) {
            const data = await workspace.fs.readFile(logURI);
            if (data.length > 0) {
                return;
            }
            await delay(1000);
        }
        throw new Error("Cultist simulator failed to start");
    }
    private _problemChecker = null;
    private startProblemChecker(logURI: Uri) {
        this._problemChecker = setInterval(async () => {
            try {
                if (!(await this.isCultistSimulatorRunning())) {
                    this.output("Cultist Simulator was closed by user");
                    await this.stopAll();
                }
                const data = (await workspace.fs.readFile(logURI)).toString();
                if (data.includes("Assets.CS.TabletopUI.TabletopManager.Start")) {
                    this.output("Cultist Simulator was terminated by debugger due to error detected");
                    this.stopAll(true);
                    vscode.commands.executeCommand(
                        "cultsim.open.log",
                        logURI
                    );
                }
            } catch (e) {
                console.error(e);
            }
        }, 1000);
    }

    private async stopAll(end = true) {
        if (this._problemChecker) {
            clearInterval(this._problemChecker);
            this._problemChecker = null;
        }
        if (await this.isCultistSimulatorRunning()) {
            await this.stopCultistSimulator();
        }
        if (end) this.end();
    }

    protected output(text: string, type: 'prio' | 'out' | 'err' = null, filePath?: string, line?: number, column?: number) {
        let category: string;
        switch (type) {
            case 'prio': category = 'important'; break;
            case 'out': category = 'stdout'; break;
            case 'err': category = 'stderr'; break;
            default: category = 'console'; break;
        }
        const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`, category);

        if (text === 'start' || text === 'startCollapsed' || text === 'end') {
            e.body.group = text;
            e.body.output = `group-${text}\n`;
        }

        if (filePath) e.body.source = this.createSource(filePath);
        if (line) e.body.line = this.convertDebuggerLineToClient(line);
        if (column) e.body.column = this.convertDebuggerColumnToClient(column);
        this.sendEvent(e);
    }

    protected end() {
        this.sendEvent(new TerminatedEvent());
    }

    private createSource(filePath: string): Source {
        return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'cultsim-adapter-data');
    }
}

class CultsimDebugAdapterFactory implements DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(_session: DebugSession): ProviderResult<DebugAdapterDescriptor> {
        return new DebugAdapterInlineImplementation(new CultsimSession());
    }
}

class CultsimConfigurationProvider implements DebugConfigurationProvider {

    /**
     * Massage a debug configuration just before a debug session is being launched,
     * e.g. add all missing attributes to the debug configuration.
     */
    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

        // if launch.json is missing or empty
        if (!config.type && !config.request && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'markdown') {
                config.type = 'cultsim';
                config.name = 'Cultist Simulator: Launch';
                config.request = 'launch';
            }
        }

        return config;
    }
}