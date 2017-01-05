$(() => {
  const trelloshift = new Trelloshift()
});

class Trelloshift {
  constructor() {
    Trello.authorize({
      name: 'Trelloshift',
      scope: {
        read: 'true',
        write: 'true' },
      expiration: 'never',
      success: this.authenticationSuccess.bind(this),
      error: this.authenticationFailure.bind(this)
    });
  }

  authenticationSuccess() {
    $('#message').text("logged in!");
    $('#old-start-date').datepicker();
    $('#new-start-date').datepicker();
    this.getBoards();

    $('form').on('submit', (e) => {
      e.preventDefault();
      this.copyBoard();
    });
  }

  authenticationFailure() {
    $('#message').text("not logged in!");
    $('form').hide();
  }

  getBoards() {
    return Trello.get("/members/me/boards?filter=open", done, fail);

    function done(data) {
      return data.forEach(function(board) {
        console.log(board);
        $("#old-board-name").prepend("<option value='"+ board.id +"'>"+ board.name +"</option>");
      });
    }

    function fail(data) {
      return console.error(data);
    };
  }

  copyBoard() {
    $("#message").text("Copying board");
    let newBoardName = $("#new-board-name").val();
    let oldBoardId = $("#old-board-name").val();
    let oldStartDate = $("#old-start-date").val();
    let newStartDate = $("#new-start-date").val();
    let advancement = this.calculateDaysSkipped(oldStartDate, newStartDate);
    return Trello.post("/boards", {
      name: newBoardName,
      idBoardSource: oldBoardId
    }, done.bind(this), fail.bind(this));

    function done(data) {
      return this.moveCards(data.id, advancement);
    }

    function fail(data) {
      return console.error(data);
    }
  }

  calculateDaysSkipped(oldStartDate, newStartDate) {
    var day = 24*60*60*1000;
    var date1  = new Date(oldStartDate);
    var date2  = new Date(newStartDate);
    return Math.round(Math.abs((date1.getTime() - date2.getTime())/(day)));
  }

  moveCards(id, advancement) {
    $("#message").text("Moving cards");
    Trello.get("/boards/"+id+"/cards", doneGet.bind(this), failGet.bind(this));

    function doneGet(data) {
      let cards = data.length;
      data.forEach((card, i) => {
        setTimeout(() => {
          cards--;
          let newDate = this.createNewDate(card.due, advancement);
          Trello.put("/cards/"+card.id+"/due", { value: newDate }, donePut.bind(this), failPut.bind(this))

          function donePut(data) {
            $(".message").text(cards + " cards remaining");
            if (cards === 0) return $(".message").text("Complete!");
          }

          function failPut(data) {
            return console.error(data);
          }
        }, i*100);
      })
    }

    function failGet(data) {
      return console.error(data);
    }
  }

  createNewDate(dueOriginally, advancement) {
    var newDate = new Date(dueOriginally);
    return newDate.setDate(newDate.getDate() + advancement);
  };
}

