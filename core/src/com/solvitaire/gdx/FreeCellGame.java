package com.solvitaire.gdx;

import com.badlogic.gdx.Game;

public class FreeCellGame extends Game {
   @Override
   public void create() {
      this.setScreen(new FreeCellScreen());
   }
}
