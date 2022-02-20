import * as vscode from 'vscode';
import { Content } from '../../model/content';
import { Entity } from '../../model/entity';

export class ExplorerView implements vscode.TreeDataProvider<TreeItem> {

	private static readonly viewType = 'cultsim.explorer';

	_contentType?: string;
	_coreContent?: Content;

	constructor(context: vscode.ExtensionContext, coreContent?: Content, contentTypeName?: string) {
		this._contentType = contentTypeName;
		this._coreContent = coreContent;
		const view = vscode.window.createTreeView(ExplorerView.viewType + (contentTypeName ? "." + contentTypeName : ""), { treeDataProvider: this, showCollapseAll: true });
		context.subscriptions.push(view);
	}

	public getTreeItem(element: TreeItem): vscode.TreeItem {
		return element.getTreeItem();
	}

	public getChildren(element?: TreeItem): Thenable<TreeItem[]> {
		if (!element) return this.getRoot();
		return element.getChildren();
	}

	private getRoot(): Thenable<TreeItem[]> {
		let categories: CategoryTreeItem[];
		if (this._contentType && this._coreContent) {
			const local = new CategoryTreeItem("Local", "Content within your workspace");
			const core = new CategoryTreeItem("Core", "Core content from streaming assets folder");
			for (const item of this._coreContent[this._contentType] || []) {
				core.add(item);
			}
			if (local.hasChildren() && core.hasChildren()) {
				categories.push(local);
				categories.push(core);
			} else if (local.hasChildren()) {
				return local.getChildren();
			} else if (core.hasChildren()) {
				return core.getChildren();
			}
		} else if (this._coreContent) {
			const elements = new CategoryTreeItem("Elements", "Core content elements from streaming assets folder");
			const recipes = new CategoryTreeItem("Recipes", "Core content recipes from streaming assets folder");
			const decks = new CategoryTreeItem("Decks", "Core content decks from streaming assets folder");
			const legacies = new CategoryTreeItem("Legacies", "Core content legacies from streaming assets folder");
			const endings = new CategoryTreeItem("Endings", "Core content endings from streaming assets folder");
			const verbs = new CategoryTreeItem("Verbs", "Core content verbs from streaming assets folder");
			for (const item of this._coreContent.elements) {
				elements.add(item);
			}
			for (const item of this._coreContent.recipes) {
				recipes.add(item);
			}
			for (const item of this._coreContent.decks) {
				decks.add(item);
			}
			for (const item of this._coreContent.legacies) {
				legacies.add(item);
			}
			for (const item of this._coreContent.endings) {
				endings.add(item);
			}
			for (const item of this._coreContent.verbs) {
				verbs.add(item);
			}
			return Promise.resolve([
				elements,
				recipes,
				decks,
				legacies,
				endings,
				verbs,
			]);
		}
		return Promise.resolve(categories);
	}
}

interface TreeItem {
	getTreeItem(): vscode.TreeItem
	hasChildren(): boolean
	getChildren(): Thenable<TreeItem[]>
}

class CategoryTreeItem extends vscode.TreeItem implements TreeItem {
	private _entities = new Array<EntityTreeItem>();
	constructor(
		label: string,
		tooltip: string,
		entities?: Entity<any>[],
	) {
		super(label, entities?.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
		this.description = `(${entities?.length || 0})`;
		this.tooltip = tooltip;
		if (entities) {
			for (const entity of entities) {
				this.add(entity);
			}
		}
	}

	public add(entity: Entity<any>) {
		this._entities.push(new EntityTreeItem(entity));
		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.description = `(${this._entities?.length || 0})`;
	}

	hasChildren(): boolean {
		return this._entities.length > 0;
	}
	getTreeItem(): vscode.TreeItem {
		return this;
	}
	getChildren(): Thenable<TreeItem[]> {
		return Promise.resolve(this._entities);
	}
}

class EntityTreeItem extends vscode.TreeItem implements TreeItem {
	constructor(
		private readonly entity: Entity<any> | any
	) {
		super(entity.id, vscode.TreeItemCollapsibleState.Collapsed);
		this.tooltip = (entity?.label || "") + "\n\n" + (entity?.description || "");
		this.description = entity?.label;
	}
	hasChildren(): boolean {
		return false;
	}
	getTreeItem(): vscode.TreeItem {
		return this;
	}
	getChildren(): Thenable<TreeItem[]> {
		const items = new Array<TreeItem>();
		if ('has' in this.entity) {
			for (const [propertyName, propertyValue] of this.entity) {
				const property = new PropertyTreeItem(propertyName, this.entity);
				if (property.hasChildren() || (property.description?.toString()?.length || 0) > 0) {
					items.push(property);
					this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
				}
			}
		} else {
			for (const propertyName in this.entity) {
				const property = new PropertyTreeItem(propertyName, this.entity);
				if (property.hasChildren() || (property.description?.toString()?.length || 0) > 0) {
					items.push(property);
					this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
				}
			}
		}
		return Promise.resolve(items);
	}
}

class PropertyTreeItem extends vscode.TreeItem implements TreeItem {
	private value: any;
	constructor(
		private readonly propertyName: string,
		private readonly entityOrValue?: any,
	) {
		super(propertyName, vscode.TreeItemCollapsibleState.None);
		this.tooltip = "";
		this.description = "";
		if (!this.entityOrValue) return;
		if (typeof this.entityOrValue === 'object') {
			this.value = entityOrValue[propertyName];
		} else {
			this.value = entityOrValue;
		}
		if (!this.value) return;
		if (typeof this.value == 'string') {
			this.description = this.value.toString();
		} else if (typeof this.value == 'boolean') {
			this.description = this.value ? "true" : "false";
		} else if (typeof this.value == 'number') {
			this.description = this.value.toString();
		} else if (typeof this.value == 'object') {
			if (Array.isArray(this.value)) {
				if (this.value.length > 0) this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			} else if (Object.keys(this.value).length > 0) {
				this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			}
		}
		this.tooltip = this.description;
	}
	hasChildren(): boolean {
		return this?.collapsibleState != vscode.TreeItemCollapsibleState.None || false;
	}
	getTreeItem(): vscode.TreeItem {
		return this;
	}
	getChildren(): Thenable<TreeItem[]> {
		const items = new Array<TreeItem>();
		if (Array.isArray(this.value)) {
			for (const item of this.value) {
				if (typeof item === 'object' && 'id' in item) {
					items.push(new EntityTreeItem(item));
				} else {
					items.push(new PropertyTreeItem(item));
				}
			}
		} else if (Object.keys(this.value).length > 0) {
			if ('id' in this.value) {
				items.push(new EntityTreeItem(this.value));
			} else {
				for (const key in this.value) {
					const value = this.value[key];
					if (!value) continue;
					items.push(new PropertyTreeItem(key, value));
				}
			}
		}
		return Promise.resolve(items);
	}
}