import { SlowModeSpell } from "../models/spells/slowmode.spell";
import { SuddenStopSpell } from "../models/spells/suddenstop.spell";

export enum SpellEnum {
  SlowMode,
  SuddenStop,
}

export class SpellFactory {
  static createSpell(spell: SpellEnum) {
    switch (spell) {
      case SpellEnum.SuddenStop:
        return new SuddenStopSpell();
      case SpellEnum.SlowMode:
        return new SlowModeSpell();
    }
  }
}
