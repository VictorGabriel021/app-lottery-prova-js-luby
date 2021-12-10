(function (win, DOM, doc) {
  'use strict';

  function app() {
    var selectedNumbers = new Set();

    return {
      init: function init() {
        this.getLotteryGames();
        this.completeGame();
        this.clearGame();
        this.addToCart();
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
        win.minCartValue = games['min-cart-value'];
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
        win.game = this.game;
        win.selectedNumbers = new Set();
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
          if (win.game) {
            selectedNumbers = app().clearListNumbers(selectedNumbers);
            while (selectedNumbers.size < win.game['max-number']) {
              selectedNumbers.add(Math.ceil(Math.random() * win.game.range));
            }
            selectedNumbers.forEach(function (item) {
              var $numbers = doc.getElementsByClassName(`chooice-number${item}`)
              $numbers[0].style.backgroundColor = '#27c383';
            });
            win.selectedNumbers = selectedNumbers;
          }
        });
      },

      clearListNumbers: function clearListNumbers(selectedNumbers) {
        var maxSelectedNumber = Math.max.apply(Math, [...selectedNumbers]);
        if (win.game.range >= maxSelectedNumber)
          app().clearSelectedNumbers(selectedNumbers);
        return selectedNumbers = new Set();
      },

      clearGame: function clearGame() {
        var $btnClearGame = new DOM('[data-js="clear-game"]');
        $btnClearGame.on('click', function () {
          if (win.game)
            selectedNumbers = app().clearListNumbers(selectedNumbers);
          win.selectedNumbers = selectedNumbers;
        });
      },

      clearSelectedNumbers: function clearSelectedNumbers(selectedNumbers) {
        selectedNumbers.forEach(function (item) {
          var $numbers = doc.getElementsByClassName(`chooice-number${item}`)
          $numbers[0].style.backgroundColor = `#adc0c4`;
        });
      },

      addToCart: function addToCart() {
        var $btnAddToCart = new DOM('[data-js="add-to-cart"]');
        win.total = 0;
        win.item = 0;
        win.id = 0;
        $btnAddToCart.on('click', app().createItemCart);
      },

      createItemCart: function createItemCart() {
        if (win.selectedNumbers && win.selectedNumbers?.size > 0) {
          if (win.minCartValue > win.item) {
            app().createItem();
            app().addItemStylesCss();

            win.total += win.game.price;
            app().getTotalCart();
          }
          else
            win.alert('O máximo de jogos por pessoa é 30');
        }
      },

      createItem: function createItem() {
        var listNumbers = app().addNumberZero();
        var $itensCart = new DOM('[data-js="itens-cart"]');
        $itensCart.get().insertAdjacentHTML('beforeend',
          `
            <div class="d-flex align-items-center mb-4" data-js="item-container${++win.id}">
              <img src="images/bin.png" alt="bin" class="lottery-bin-icon" data-js="bin-image${win.id}" />
              <div class="lottery-register-info${win.id}">
                <p class="lottery-register">${listNumbers.join()}</p>
                <p class="lottery-register lottery-game-registered${win.id}">
                  ${win.game.type}
                  <span class="lottery-game-price">
                    ${Number(win.game.price).toLocaleString(
                      'pt-BR', { style: 'currency', currency: 'BRL' }
                    )}
                  </span >
                </p >
              </div >
            </div >
          `
        );
        ++win.item;
        app().removeItemCart($itensCart, win.id, win.game.price);
      },

      removeItemCart: function removeItemCart($itensCart, index, price) {
        var $binImg = new DOM(`[data-js="bin-image${index}"]`);
        $binImg.on('click', function (e) {
          if (win.confirm('Deseja realmente excluir este item do carrinho ?')) {
            $itensCart.get().removeChild(doc.querySelector(`[data-js="item-container${index}"]`));
            win.total -= price;
            win.item -= 1;
            app().getTotalCart();
          }
        });
      },

      getTotalCart: function getTotalCart() {
        var $totalCart = new DOM('[data-js="total-cart"]');
        $totalCart.get().textContent = `TOTAL: ${win.total.toLocaleString(
          'pt-BR', { style: 'currency', currency: 'BRL' }
        )}`;
      },

      addNumberZero: function addNumberZero() {
        var selectedNumbersListAscOrder = [...win.selectedNumbers].sort((x, y) => x - y);
        return selectedNumbersListAscOrder.map(function (item) {
          if (item < 10)
            item = '0' + item;
          return item;
        });
      },

      addItemStylesCss: function addItemStylesCss() {
        var $lotteryGameRegisteredCss = doc.getElementsByClassName(`lottery-game-registered${win.id}`);
        var $lotteryRegisterInfoCss = doc.getElementsByClassName(`lottery-register-info${win.id}`);
        $lotteryGameRegisteredCss[0].style.color = `${win.game.color} `;
        $lotteryRegisterInfoCss[0].style.borderLeft = `5px solid ${win.game.color} `;
        $lotteryRegisterInfoCss[0].style.padding = '7px 0 7px 10px';
      }
    };
  }
  app().init();
})(window, window.DOM, document);
