import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
    dbUrl: string;
    currentUserName: string;
}

export function setUser(username: string): void {

    const configFile = readConfig();
    const userConfig: Config = {
        dbUrl: configFile.dbUrl,
        currentUserName: username
    };
    
    writeConfig(userConfig);
    
}

export function getConfigFilePath(): string {
    return path.join(os.homedir(),".gatorconfig.json");
}

export function writeConfig(cfg: Config): void {
    const filepath = getConfigFilePath();
    const writeObj = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName
    }
    fs.writeFileSync(filepath, JSON.stringify(writeObj));
}

export function readConfig(): Config {
    const filepath = getConfigFilePath();
    const fileContents = fs.readFileSync(filepath, 'utf8');
    const raw = JSON.parse(fileContents);
    const cfg = validateConfig(raw);
    return cfg;
}

export async function getCurrentUser(): Promise<string> {
    const currentConfig = readConfig();
    return currentConfig.currentUserName;
}

export function validateConfig(raw: any): Config {
    if (typeof raw !== "object" || raw === null) {
    throw new Error("Config must be an object");
    }

    if (typeof raw.db_url !== "string") {
    throw new Error("db_url must be a string");
    }

    if (raw.current_user_name !== undefined && typeof raw.current_user_name !== "string") {
    throw new Error("current_user_name must be a string");
    }
    const configObj = {
        dbUrl: raw.db_url,
        currentUserName: raw.current_user_name ?? "",
    };
    return configObj;
}