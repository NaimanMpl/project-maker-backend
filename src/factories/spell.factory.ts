import { DrunkModeSpell } from "../models/spells/drunkmode.spell";
import { QuicknessSpell } from "../models/spells/quickness.spell";
import { SlowModeSpell } from "../models/spells/slowmode.spell";
import { SuddenStopSpell } from "../models/spells/suddenstop.spell";

export enum SpellEnum {
  SlowMode,
  SuddenStop,
  Quickness,
  DrunkMode,
}

export class SpellFactory {
  static createSpell(spell: SpellEnum) {
    switch (spell) {
      case SpellEnum.SuddenStop:
        return new SuddenStopSpell();
      case SpellEnum.SlowMode:
        return new SlowModeSpell();
      case SpellEnum.Quickness:
        return new QuicknessSpell();
      case SpellEnum.DrunkMode:
        return new DrunkModeSpell();
    }
  }
}
