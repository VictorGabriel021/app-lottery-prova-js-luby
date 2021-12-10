(function (win, DOM, doc) {
  'use strict';

  function app() {
    var selectedNumbers = new Set();

    return {
      init: function init() {
        this.getLotteryGames();
        this.completeGame();
        this.clearGame();
      },

      getLotteryGames: function getLotteryGames() {
        var getGames = new XMLHttpRequest();
        getGames.open('GET', 'games.json');
        getGames.send();
        getGames.onreadystatechange = function () {
          if (app().isRequestOk.call(this))
            app().createButtonLotteryGame(JSON.parse(getGames.responseText));
        };
      },

      isRequestOk: function isRequestOk() {
        return this.readyState === 4 && this.status === 200;
      },

      createButtonLotteryGame: function createButtonLotteryGame(games) {
        var $lotteryGames = new DOM('[data-js="lottery-games"]');
        games.types.forEach((game, index) => {
          $lotteryGames.get().insertAdjacentHTML('beforeend',
            `<button class="btn btn-chooice btn-chooice-color${index} mr-20">${game.type}</button>`
          );

          var $btnChooiceColor = doc.getElementsByClassName(`btn-chooice-color${index}`);
          $btnChooiceColor[0].style.color = `${game.color}`;
          $btnChooiceColor[0].style.borderColor = `${game.color}`;
          app().addEvents($btnChooiceColor[0], game.color, games.types[index]);
        });
      },

      addEvents: function addEvents(element, color, game) {
        element.color = color;
        element.game = game;
        element.addEventListener('mouseover', app().getStyleMouseOver, false);
        element.addEventListener('mouseout', app().getStyleMouseout, false);
        element.addEventListener('click', app().loadLotteryInfo, false);
      },

      getStyleMouseOver: function getStyleMouseOver() {
        this.style.color = '#FFF';
        this.style.backgroundColor = `${this.color}`;
      },

      getStyleMouseout: function getStyleMouseout() {
        this.style.color = `${this.color}`;
        this.style.backgroundColor = '#FFF';
      },

      loadLotteryInfo: function loadLotteryInfo() {
        var $lotteryTitle = new DOM('[data-js="lottery-title"]');
        var $lotteryDescription = new DOM('[data-js="lottery-description"]');
        $lotteryTitle.get().textContent = `for ${this.game.type}`;
        $lotteryDescription.get().textContent = this.game.description;
        app().createNumbersLottery(this.game.range);
        win.maxNumber = this.game['max-number'];
        win.rage = this.game.range;
      },

      createNumbersLottery: function createNumbersLottery(numbers) {
        var $lotteryNumbers = new DOM('[data-js="lottery-numbers"]');
        $lotteryNumbers.get().textContent = '';
        for (var i = 1; i <= numbers; i++) {
          var zero = '';
          if (i < 10)
            zero = '0';
          $lotteryNumbers.get().insertAdjacentHTML('beforeend',
            `<p class="chooice-number chooice-number${i}" >${zero}${i}</p>`
          );
        }
      },

      completeGame: function completeGame() {
        var $btnCompleteGame = new DOM('[data-js="complete-game"]');
        $btnCompleteGame.on('click', function () {
          selectedNumbers = app().clearListNumbers(selectedNumbers);
          while (selectedNumbers.size < win.maxNumber) {
            selectedNumbers.add(Math.ceil(Math.random() * win.rage));
          }
          selectedNumbers.forEach(function (item) {
            var $numbers = doc.getElementsByClassName(`chooice-number${item}`)
            $numbers[0].style.backgroundColor = '#27c383';
          });
        });
      },

      clearListNumbers: function clearListNumbers(selectedNumbers) {
        var maxSelectedNumber = Math.max.apply(Math, [...selectedNumbers]);
        if (win.rage >= maxSelectedNumber)
          app().clearSelectedNumbers(selectedNumbers);
        return selectedNumbers = new Set();
      },

      clearGame: function clearGame() {
        var $btnClearGame = new DOM('[data-js="clear-game"]');
        $btnClearGame.on('click', function () {
          selectedNumbers = app().clearListNumbers(selectedNumbers);
        });
      },

      clearSelectedNumbers: function clearSelectedNumbers(selectedNumbers) {
        selectedNumbers.forEach(function (item) {
          var $numbers = doc.getElementsByClassName(`chooice-number${item}`)
          $numbers[0].style.backgroundColor = `#adc0c4`;
        });
      }
    };
  }
  app().init();
})(window, window.DOM, document);
