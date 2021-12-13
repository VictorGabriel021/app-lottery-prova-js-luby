(function (win, DOM, doc) {
  'use strict';

  var minCartValue;
  var selectedNumbers;
  var selectedGame;
  var totalCart = 0;
  var totalItensCart = 0;
  var itemId = 0;

  function app() {
    return {
      init: function init() {
        this.getLotteryGames();
        this.completeGame();
        this.clearGame();
        this.addToCart();
        this.saveItens();
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
        minCartValue = games['min-cart-value'];
        var $lotteryGames = new DOM('[data-js="lottery-games"]');
        games.types.forEach((game, index) => {
          $lotteryGames.get().insertAdjacentHTML('beforeend',
            `<button class="btn btn-chooice btn-chooice-color${index} mr-20 mb-3">${game.type}</button>`
          );

          var $btnChooiceColor = new DOM(`.btn-chooice-color${index}`);
          app().addCssInButtonGame(index, game.color);
          $btnChooiceColor.get().game = games.types[index];
          $btnChooiceColor.get().color = game.color;
          $btnChooiceColor.get().addClassCss = index;
          $btnChooiceColor.get().addEventListener('click', app().loadLotteryInfo, false);
        });
      },

      addCssInButtonGame: function addCssInButtonGame(index, color) {
        var css = `
        .btn-chooice-color${index} {
          background-color: #FFF;
          color: ${color};
          border-color: ${color};
        }
        .btn-chooice-color${index}:hover, .selected${index} {
          background-color: ${color};
          color: #FFF;
        }`;

        var style = doc.createElement('style');
        if (style.styleSheet)
          style.styleSheet.cssText = css;
        else
          style.appendChild(doc.createTextNode(css));
        doc.getElementsByTagName('head')[0].appendChild(style);
      },

      loadLotteryInfo: function loadLotteryInfo() {
        app().addCssButtonSelected.call(this);
        var $lotteryTitle = new DOM('[data-js="lottery-title"]');
        var $lotteryDescription = new DOM('[data-js="lottery-description"]');
        $lotteryTitle.get().textContent = `for ${this.game.type}`;
        $lotteryDescription.get().textContent = this.game.description;
        app().createNumbersLottery(this.game.range);
        selectedGame = this.game;
        selectedNumbers = new Set();
      },

      addCssButtonSelected: function addCssButtonSelected() {
        Array.prototype.forEach.call(this.parentNode.children, function (item, index) {
          item.classList.remove(`selected${index}`);
        });
        this.classList.add(`selected${this.addClassCss}`);
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
          if (selectedGame) {
            selectedNumbers = app().clearListNumbers();
            while (selectedNumbers.size < selectedGame['max-number']) {
              selectedNumbers.add(Math.ceil(Math.random() * selectedGame.range));
            }
            selectedNumbers.forEach(function (item) {
              var $numbers = new DOM(`.chooice-number${item}`)
              $numbers.get().style.backgroundColor = '#27c383';
            });
          }
        });
      },

      clearListNumbers: function clearListNumbers() {
        var maxSelectedNumber = Math.max.apply(Math, [...selectedNumbers]);
        if (selectedGame.range >= maxSelectedNumber)
          app().clearSelectedNumbers();
        return selectedNumbers = new Set();
      },

      clearGame: function clearGame() {
        var $btnClearGame = new DOM('[data-js="clear-game"]');
        $btnClearGame.on('click', function () {
          if (selectedGame)
            selectedNumbers = app().clearListNumbers(selectedNumbers);
        });
      },

      clearSelectedNumbers: function clearSelectedNumbers() {
        selectedNumbers.forEach(function (item) {
          var $numbers = new DOM(`.chooice-number${item}`)
          $numbers.get().style.backgroundColor = `#adc0c4`;
        });
      },

      addToCart: function addToCart() {
        var $btnAddToCart = new DOM('[data-js="add-to-cart"]');
        $btnAddToCart.on('click', app().createItemCart);
      },

      createItemCart: function createItemCart() {
        if (selectedNumbers && selectedNumbers?.size > 0) {
          app().createItem();
          app().addItemStylesCss();
          totalCart += selectedGame.price;
          app().getTotalCart();
        }
      },

      createItem: function createItem() {
        var listNumbers = app().addNumberZero();
        var $itensCart = new DOM('[data-js="itens-cart"]');
        $itensCart.get().insertAdjacentHTML('beforeend',
          `
            <div class="d-flex align-items-center mb-4" data-js="item-container${++itemId}">
              <img src="images/bin.png" alt="bin" class="lottery-bin-icon" data-js="bin-image${itemId}" />
              <div class="lottery-register-info${itemId}">
                <p class="lottery-register">${listNumbers.join()}</p>
                <p class="lottery-register lottery-game-registered${itemId}">
                  ${selectedGame.type}
                  <span class="lottery-game-price">
                    ${Number(selectedGame.price).toLocaleString(
                      'pt-BR', { style: 'currency', currency: 'BRL' }
                    )}
                  </span >
                </p >
              </div >
            </div >
          `
        );
        ++totalItensCart;
        app().removeItemCart($itensCart, itemId, selectedGame.price);
      },

      addNumberZero: function addNumberZero() {
        var selectedNumbersListAscOrder = [...selectedNumbers].sort((x, y) => x - y);
        return selectedNumbersListAscOrder.map(function (item) {
          if (item < 10)
            item = '0' + item;
          return item;
        });
      },

      removeItemCart: function removeItemCart($itensCart, itemId, price) {
        var $binImg = new DOM(`[data-js="bin-image${itemId}"]`);
        $binImg.on('click', function (e) {
          if (win.confirm('Deseja realmente excluir este item do carrinho ?')) {
            $itensCart.get().removeChild(doc.querySelector(`[data-js="item-container${itemId}"]`));
            totalCart -= price;
            totalItensCart -= 1;
            app().getTotalCart();
          }
        });
      },

      getTotalCart: function getTotalCart() {
        var $totalCart = new DOM('[data-js="total-cart"]');
        $totalCart.get().textContent = `TOTAL: ${totalCart.toLocaleString(
          'pt-BR', { style: 'currency', currency: 'BRL' }
        )}`;
      },

      addItemStylesCss: function addItemStylesCss() {
        var $lotteryGameRegisteredCss = new DOM(`.lottery-game-registered${itemId}`);
        var $lotteryRegisterInfoCss = new DOM(`.lottery-register-info${itemId}`);
        $lotteryGameRegisteredCss.get().style.color = `${selectedGame.color} `;
        $lotteryRegisterInfoCss.get().style.borderLeft = `5px solid ${selectedGame.color} `;
        $lotteryRegisterInfoCss.get().style.padding = '7px 0 7px 10px';
      },

      saveItens: function saveItens() {
        var $saveItens = new DOM('[data-js="save-itens"]');
        $saveItens.on('click', function () {
          if (minCartValue > totalCart)
            win.alert('O valor mínimo para realizar a compra é 30 reais');
          else
            win.alert('Salvou com sucesso!');
        });
      }
    };
  }
  app().init();
})(window, window.DOM, document);
