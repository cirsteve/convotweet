var Tweet = Backbone.Model.extend({
    defaults: function() {
        return {
            user: null,
            id: null,
            entities: null,
            geo: null,
            text: null,
            to: null,
            created: null
        };
    },
    initialize: function() {
            console.log('Tweet inited');
        }
});


var Tweeter = Backbone.Model.extend({
    defaults: function() {
        return {
            username: "nameless",
            id: null,
            proileImage: null,
            primary: false
        };
    },
    initialize: function () {
            console.log('User inited');
    },
});

var Convo = Backbone.Model.extend({
    defaults: function() {
        return {
            primary: null,//tweeter model
            conversants: null,//tweeters collection
            conversantCount: 0,//integer
            tweets: null,//tweets collection
            urlTo: null,//baseurl for to tweets
            urlFrom: null//baseurl for from tweets
        };
    },
    initialize: function(options) {
        this.primary = options.primary;
        this.conversants = new Tweeters();
        this.tweets = new Tweets();
        console.log(this.tweets);
        this.urlTo = 'http://search.twitter.com/search.json?callback=?&q=to%3A'+ this.primary; 
        this.urlFrom = 'http://search.twitter.com/search.json?callback=?&q=from%3A'+ this.primary; 
        this.getAllTweets();
        console.log(this.conversants);
        this.getConversantCount();
    },
    getConversantCount: function () {
        this.conversantCount = this.conversants.length;
    },
    getAllTweets: function() {
        console.log(this.urlTo);
        var self = this;
        $.ajax({
            url: this.urlTo,
            dataType: 'jsonp',
            error: function(error) {
                console.log(error);
            },
            success: function(data) {
                console.log(self.tweets);
                data.results.forEach(function(t) {
                    console.log(self.tweets);
                    var t = new Tweet({user:t.from_user, id: t.from_user_id, entities:t.entities, geo:t.geo,text:t.text, to:t.to_user, created:t.created_at});
                    self.tweets.add(t);
                    console.log(self.tweets.length);
                    var view = new TweetView({model:t});
                    $('#'+self.primary+'tweets').append(view.render().el);
                    console.log(self.tweets);
                    var u = new Tweeter({username:t.from_user, id: t.from_user_id, profile_image: t.profile_image_url});
                    self.conversants.noDupeAdd(u);            
                    console.log(self.conversants);
                });
                self.getConversantCount();
            }
        });
        $.ajax({
            url: this.urlFrom,
            dataType: 'jsonp',
            error: function(error) {
                console.log(error);
            },
            success: function(data) {
                data.results.forEach(function(t) {
                    var t = new Tweet({user:t.from_user, id: t.from_user_id, entities:t.entities, geo:t.geo,text:t.text, to:t.to_user, created:t.created_at});
                    self.tweets.add(t);
                });
            }
        }); 
    }
});

var Convos = Backbone.Collection.extend({
    model: Convo
});

var Tweets = Backbone.Collection.extend({
    model: Tweet,
    getTweets: function(primary) {
        var fromURL, fromURLOvr, atURL, atURLOvr;
        $.ajax({
            url: 'http://twitter.com/search?q=to:louisck',
            success: function(data) {
                data.results.forEach(function(t) {
            var t = new Tweet({user:twts[i].from_user, id: twts[i].from_user_id, entities:twts[i].entities, geo:twts[i].geo,text:twts[i].text, to:twts[i].to_user, created:twts[i].created_at});
            tweetList.add(t);
            var u = new Tweeter({username:twts[i].from_user, id: twts[i].from_user_id, profile_image: twts[i].profile_image_url});
            tweeterList.noDupeAdd(u);            
                });
            }
        });
    }
});

var Tweeters = Backbone.Collection.extend({
    model: Tweeter,
    noDupeAdd: function (tweeterInstance) {
        var t = _.any(this.models,function(tweeter) {
                return tweeter.get("id") === tweeterInstance.get("id");
            });
        if (!t) {
            this.add(tweeterInstance);
        }
    }
});

var TweetView = Backbone.View.extend({
    tag_name: "li",
    template: _.template($('#tweet-tmpl').html()),
    initialize: function() {
        this.render();
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
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

var TweeterView = Backbone.View.extend({
    tag_name: "li",
    template: _.template($('#tweeter-tmpl').html()),
    initialize: function() {
        this.render();
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

var ConvoView = Backbone.View.extend({
    tagName: "li",
    template: _.template($('#convo-tmpl').html()),
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

var AppView = Backbone.View.extend({
    el: $("#twitdash"),
    events: {
        "click #searchSubmit": "getConvo"
    },
    initialize: function() {
        this.convos = new Convos();
        this.render();
    },
    render: function() {
    },
    getConvo: function (e) {
        console.log('getConvo called');
        e.preventDefault();
        var search = $('#search-field');
        var term = search.val();
        console.log(term);
        search.val('');
        var ul = $('<ul></ul>')
                  .attr('id', term+'-convos');
        $('#convo-box').append(ul);
        console.log(ul);
        var convo = new Convo({primary:term});
        this.convos.add(convo);
        var view = new ConvoView({model:convo});
        $('#convos-list').append(view.render().el);
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

