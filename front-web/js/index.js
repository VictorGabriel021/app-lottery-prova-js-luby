(function (win, DOM, doc) {
  'use strict';

  function app() {
    return {
      init: function init() {
        this.getLotteryGames();
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
          app().addMouseOverAndMouseOut($btnChooiceColor[0], game.color, games.types[index]);
        });
      },

      addMouseOverAndMouseOut: function addMouseOverAndMouseOut(element, color, game) {
        element.addEventListener('mouseover', function () {
          element.style.color = '#FFF';
          element.style.backgroundColor = `${color}`;
        }, false);
        element.addEventListener('mouseout', function () {
          element.style.color = `${color}`;
          element.style.backgroundColor = '#FFF';
        }, false);
        element.addEventListener('click', function () {
          var $lotteryTitle = new DOM('[data-js="lottery-title"]');
          var $lotteryDescription = new DOM('[data-js="lottery-description"]');
          $lotteryTitle.get().textContent = `for ${game.type}`;
          $lotteryDescription.get().textContent = game.description;
          app().createNumbersLottery(game.range);
        }, false);
      },

      createNumbersLottery: function createNumbersLottery(numbers) {
        var $lotteryNumbers = new DOM('[data-js="lottery-numbers"]');
        $lotteryNumbers.get().textContent = '';

        for (var i = 1; i <= numbers; i++) {
          var zero = '';
          if (i < 10)
            zero = '0';
          $lotteryNumbers.get().insertAdjacentHTML('beforeend',
            `<p class="chooice-number" >${zero}${i}</p>`
          );
        }
      },
    };
  }

  app().init();
})(window, window.DOM, document);
