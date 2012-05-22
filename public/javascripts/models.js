var Tweet = Backbone.Model.extend({
    initialize: function() {
            console.log('Tweet inited');
        },
});


var User = Backbone.Model.extend({
    defaults: {
        "username": "nameless",
        "id": null,
        "proileImage": null
    },

    initialize: function() {
            console.log('User inited');
    }
});

var Tweets = Backbone.Collection.extend({
    model: Tweet
});

var Users = Backbone.Collection.extend({
    model: User,
    noDupeAdd: function (userInstance) {
        var u = _.any(this.models,function(user) {
                return user.get("id") === userInstance.get("id");
            });
        if (!u) {
            this.add(userInstance);
        }
    }
});

var TweetView = Backbone.View.extend({
    tag_name: "li",
    initialize: function() {
        this.render();
    },
    render: function () {
        var template = _.template($('#tweet-tmpl').html(), {});
        this.el.html(template);
    }
});

var TweetsView = Backbone.View.extend({
    tag_name: "ul",
    initialize: function() {
        this.render();
    },
    render: function () {
        var template =  _.template($('#tweets-tmpl').html(), {});
        this.el.html(template);
    }
});

var UserView = Backbone.View.extend({
    tag_name: "div",
    initialize: function() {
        this.render();
    },
    render: function () {
        var template =  _.template($('#user-tmpl').html(), {});
        this.el.html(template);
    }
});

var UsersView = Backbone.View.extend({
    tag_name: "ul",
    initialize: function() {
        this.render();
    },
    render: function () {
        var template =  _.template($('#users-tmpl').html(), {});
        this.el.html(template);
    }
});

var AppView = Backbone.View.extend({
    el: $("#twitdash"),
    events: {
        "click #searchSubmit": "searchTermSubmit"
    },
    initialize: function() {
        this.socket = this.options.socket;
        this.render();
    },
    render: function() {
        console.log(this.socket);
        this.socket.emit('getSearch', {term:"j2labs"});
    },
    searchTermSubmit: function(e) {
        console.log('searchTermSubmit called');
        e.preventDefault();
        var search = $('#search-field');
        var term = search.val();
        console.log(term);
        search.val('');
        this.socket.emit('getSearch', {term:term});
    }
});

