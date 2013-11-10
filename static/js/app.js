// Generated by CoffeeScript 1.6.3
(function() {
  var buildChatLine, transformText;

  transformText = function(text, cb) {
    var output, to_execute, to_wget, xkcd_id;
    if (text[0] === "\`") {
      to_execute = text.slice(1);
      output = eval(to_execute);
      return cb(to_execute + "<br><br>&gt;&gt; " + output);
    } else if (text.slice(0, 5) === "wget ") {
      to_wget = text.slice(5);
      return "<iframe src=" + to_wget + "></iframe>";
    } else if (text.slice(0, 5) === "xkcd ") {
      xkcd_id = text.match(/\d+/)[0];
      return $.ajax({
        url: "http://dynamic.xkcd.com/api-0/jsonp/comic/" + xkcd_id + "?callback=?",
        dataType: "json",
        jsonpCallback: "xkcddata",
        async: false,
        success: function(data) {
          return cb("<img style='width:600px; height: auto' src='" + data.img + "'>");
        }
      }).responseText;
    } else {
      return cb(text);
    }
  };

  buildChatLine = function(user, body, date, color) {
    return "<span><span style='color:" + color + "' class='userstamp'>" + user + "</span>: " + body + "<span class='timestamp'>" + date + "</span></span>";
  };

  window.ChatView = Backbone.View.extend({
    el: 'body',
    events: {
      "keyup .sendbox": "onSendBoxKeyUp",
      "click .sendbutton": "sendFromButton",
      "keyup #title": "onTitleEditorKeyUp"
    },
    initialize: function(user, chat) {
      var str,
        _this = this;
      this.chat = chat;
      this.user = user;
      socket.on('new_msg', function(data) {
        return _this.onNewMsg(data.user, data.msg, data.date, data.color);
      });
      socket.on('title_update', function(title) {
        return _this.updateTitle(title);
      });
      socket.emit('subscribe', this.chat._id);
      if (this.chat.title) {
        this.updateTitle(this.chat.title);
      }
      str = "";
      _.each(chat.messages, function(msg) {
        return str += "" + (buildChatLine(msg.username, msg.body, msg.date, msg.color));
      });
      $("#chatbox").html(str);
      $(window).on('resize', this.scrollToBottom);
      $(window).load(function() {
        return _this.scrollToBottom();
      });
      return $(".sendbox").focus();
    },
    onTitleEditorKeyUp: function(e) {
      var new_val, title;
      title = $("#title");
      new_val = title.val();
      socket.emit('update_title', new_val);
      return document.title = new_val;
    },
    updateTitle: function(title) {
      document.title = title;
      return $("#title").val(title);
    },
    scrollToBottom: function() {
      return $("#chatbox").scrollTop($('#chatbox')[0].scrollHeight);
    },
    onNewMsg: function(user, msg, date, color) {
      console.log("OnNew Mesg");
      $("#chatbox").append("<br>" + buildChatLine(user, msg, date, color));
      this.scrollToBottom();
      return _.delay(this.scrollToBottom, 250);
    },
    sendFromButton: function() {
      this.sendMessage($(".sendbox").val());
      return $(".sendbox").val('');
    },
    onSendBoxKeyUp: function(e) {
      var target, target_val;
      target = $(e.target);
      target_val = target.val();
      if (target_val) {
        $(".sendbutton").prop('disabled', false);
      } else {
        $(".sendbutton").prop('disabled', true);
      }
      if (e.keyCode === 13) {
        target = $(e.target);
        target_val = target.val();
        if (!target_val) {
          return;
        }
        this.sendMessage(target_val);
        return target.val('');
      } else {
        return this.onTypeFired();
      }
    },
    sendMessage: function(message) {
      var _this = this;
      console.log("Sending message");
      return transformText(message, function(le_text) {
        console.log("transformed text: " + le_text);
        return socket.emit('msg_send', _this.user.name, le_text, _this.user.color);
      });
    },
    onTypeFired: function() {}
  });

}).call(this);
