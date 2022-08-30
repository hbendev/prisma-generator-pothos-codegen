import path from 'path';
import { ExtendedGeneratorOptions } from '../generator';
import { defaultReplacer, Replacer } from './replacer';

/** Interface used to configure generator behavior */
export interface Config {
  /** Input type generation config */
  inputs?: {
    /** How to import the Prisma namespace. Default: `'import { Prisma } from ".prisma/client"'` */
    prismaImporter?: string;
    /** How to import the Pothos builder. Overrides global builderImporter config. Default: `'import { builder } from "./builder"'` */
    builderImporter?: string;
    // TODO what is the default
    /** Path to generate the inputs file to from project root. Default: '.' */
    outputFilePath?: string;
    /** List of excluded scalars from generated output */
    excludeScalars?: string[];
    /** A function to replace generated source. Combined with global replacer config */
    replacer?: Replacer;
  };
  /** CRUD generation config */
  crud?: {
    /** Disable generaton of crud. Default: `false` */
    disabled?: boolean;
    /** How to import the Pothos builder. Overrides global builderImporter config. Default: `'import { builder } from "./builder"'` */
    builderImporter?: string;
    // TODO is this necessary + what is the default?
    /** How to import the inputs. Default `'import * as Inputs from ./inputs'` */
    inputsImporter?: string;
    /** Directory to generate crud code into from project root. Default: `'./generated'` */
    outputDir?: string;
    /** A function to replace generated source. Combined with global replacer config */
    replacer?: Replacer;

    // TODO What do these do?
    resolversImports?: string; // default: what to import inside resolver
    dbCaller?: string; // how to call prisma. default: context.db
  };
  /** Global config */
  global?: {
    /** A function to replace generated source */
    replacer?: Replacer;
    /** How to import the Pothos builder. Default: `'import { builder } from "./builder"'` */
    builderImporter?: string;
  };
}

/** Interface representing a configuration filled with default values where the original config was missing them, for internal purposes */
export interface ConfigInternal {
  inputs: {
    prismaImporter: string;
    builderImporter: string;
    outputFilePath: string;
    excludeScalars: string[];
    replacer: Replacer;
  };
  crud: {
    disabled: boolean;
    builderImporter: string;
    inputsImporter: string;
    outputDir: string;
    replacer: Replacer;

    // TODO
    resolversImports: string;
    dbCaller: string;
  };
  global: {
    replacer: Replacer;
    builderImporter: string;
  };
}

export const getDefaultConfig: (global?: Config['global']) => ConfigInternal = (global) => ({
  inputs: {
    prismaImporter: 'import { Prisma } from ".prisma/client"',
    builderImporter: global?.builderImporter || 'import { builder } from "./builder"',
    // TODO what is the default?
    outputFilePath: '.',
    excludeScalars: [],
    replacer: defaultReplacer,
  },
  crud: {
    disabled: false,
    builderImporter: global?.builderImporter || 'import { builder } from "./builder"',
    inputsImporter: 'import * as Inputs from ./inputs',
    outputDir: './generated',
    replacer: defaultReplacer,
    // TODO
    resolversImports: '???',
    dbCaller: 'context.db',
  },
  global: {
    builderImporter: global?.builderImporter || 'import { builder } from "./builder"',
    replacer: defaultReplacer,
  },
});

/** Receives the config path from generator options, loads the config from file, fills out the default values, and returns it */
export const getConfig = async (
  extendedGeneratorOptions: ExtendedGeneratorOptions,
): Promise<ConfigInternal> => {
  const schemaDirName = path.dirname(extendedGeneratorOptions.schemaPath);
  const optionsPath = path.join(
    schemaDirName,
    extendedGeneratorOptions.generatorConfigPath || 'crud-generator-configs.ts',
  );

  const optionsRequired = await import(optionsPath);
  const { inputs, crud, global }: Config = optionsRequired.configs || {};

  const defaultConfig = getDefaultConfig(global);
  const internalConfig: ConfigInternal = {
    inputs: { ...defaultConfig.inputs, ...inputs },
    crud: { ...defaultConfig.crud, ...crud },
    global: { ...defaultConfig.global, ...global },
  };

  return internalConfig;
};
