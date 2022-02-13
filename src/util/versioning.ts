
const semanticVersionRegexp = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export class SemanticVersion {
    public static Parse(text?: string) {
        return new SemanticVersion(text);
    }

    public major = 0;
    public minor = 0;
    public patch = 0;
    public rc = 0;
    public beta = 0;

    constructor(text?: string) {
        this.Parse(text);
    }

    public Parse(text?: string) {
        try {
            if (!text) return;
            const match = semanticVersionRegexp.exec(text);
            this.major = match[1] ? parseInt(match[1]) : 0;
            this.minor = match[2] ? parseInt(match[2]) : 0;
            this.patch = match[3] ? parseInt(match[3]) : 0;
            if (match[4]) {
                const [kind, value] = match[4].split(".");
                switch (kind) {
                    case "rc":
                        return this.rc = parseInt(value);
                    case "beta":
                        return this.beta = parseInt(value);
                }
            }
        } catch {
            throw new Error("not a semantic version");
        }
    }

    toString(): string {
        let suffix = "";
        if (this.rc > 0) {
            suffix += "-rc." + this.rc;
        } else if (this.beta > 0) {
            suffix += "-beta." + this.beta;
        }
        return this.major + "." + this.minor + "." + this.patch + suffix;
    }

    public Major(): SemanticVersion {
        const version = new SemanticVersion();
        version.major = this.major + 1;
        return version;
    }

    public Minor(): SemanticVersion {
        const version = new SemanticVersion();
        version.major = this.major;
        version.minor = this.minor + 1;
        return version;
    }

    public Patch(): SemanticVersion {
        const version = new SemanticVersion();
        version.major = this.major;
        version.minor = this.minor;
        version.patch = this.patch + 1;
        return version;
    }

    public RC(): SemanticVersion {
        const version = new SemanticVersion();
        version.major = this.major;
        version.minor = this.minor;
        version.patch = this.patch;
        version.rc = this.rc + 1;
        return version;
    }

    public Beta(): SemanticVersion {
        const version = new SemanticVersion();
        version.major = this.major;
        version.minor = this.minor;
        version.patch = this.patch;
        version.beta = this.beta + 1;
        return version;
    }

    public Stable(): SemanticVersion {
        const version = new SemanticVersion();
        version.major = this.major;
        version.minor = this.minor;
        version.patch = this.patch;
        return version;
    }
}