package com.solvitaire.gdx;

import com.badlogic.gdx.Game;
import com.badlogic.gdx.Screen;

public class FreeCellGame extends Game {
   @Override
   public void create() {
      this.showFreeCell();
   }

   public void showFreeCell() {
      this.switchScreen(new FreeCellScreen(this));
   }

   public void showSpider() {
      this.switchScreen(new SpiderScreen(this));
   }

   private void switchScreen(Screen nextScreen) {
      Screen previous = this.getScreen();
      this.setScreen(nextScreen);
      if (previous != null) {
         previous.dispose();
      }
   }
}
