var Tweet = Backbone.Model.extend({
    defaults: function() {
        return {
            user: null,
            id: null,
            isPrimary: false,
            entities: null,
            geo: null,
            text: null,
            to: null,
            created: null
        };
    },
    initialize: function() {
        }
});


var Tweeter = Backbone.Model.extend({
    defaults: function() {
        return {
            username: "nameless",
            id: null,
            profileImage: null,
            primary: false
        };
    },
    initialize: function () {
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
        this.tweetsf = new Tweets();
        this.tweetst = new Tweets();
        //max_id parameter can be used to get all tweets up until given id
        this.urlTo = 'http://search.twitter.com/search.json?callback=?&rpp=100&q=to%3A'+ this.primary; 
        this.urlFrom = 'http://search.twitter.com/search.json?callback=?&rpp=100&q=from%3A'+ this.primary; 
        this.conversantCount = 0;
        this.getAllTweets();
    },
    setConversantCount: function () {
        this.conversantCount =  this.conversants.length;
    },
    getUrlToExtra: function() {
        return this.urlTo+'&max_id='+_.last(this.filterTo()).get('id');
    },
    getUrlFromExtra: function() {
        return this.urlFrom+'&max_id='+_.last(this.filterFrom()).get('id');
    },
    addTweetView: function(model) {
        var view = new TweetView({model:model});
        $('#'+this.primary+'-convos').append(view.render().el);
    },
    addTweeterView: function(model) {
        var view = new TweeterView({model:model});
        $('#'+this.primary+'-info ul.conversants').append(view.render().el);
    },
    filterTo: function() {
        console.log('filterTo called');
        var list = _.filter(this.tweets.models, function(tweet) {
            return !tweet.get('isPrimary');
        });
        return list;
    },
    filterFrom: function() {
        console.log('filterFrom called');
        var list = _.filter(this.tweets.models, function(tweet) {
            return tweet.get('isPrimary');
        });
        return list;
    },
    //utility function to fetch tweets by given url parameter
    fetchTo: function() {
        console.log('fetchTo called');
        var self = this,
           count = 0;
        var test = 'boo';
        var getTweets = function (url, cb) {
            console.log('ajax '+url);
            $.ajax({
                url: url,
                dataType: 'jsonp',
                error: function(error) {
                    console.log(error);
                },
                success: function(data) {
                    var tweet, i,t;
                    count = data.results.length;
                    console.log('js count '+count);
                    for (i = 0; i < count; i++) {
                        t = data.results[i];
                        tweet = new Tweet({user:t.from_user,
                                             id:t.from_user_id,
                                      isPrimary:false,
                                       entities:t.entities,
                                            geo:t.geo,
                                           text:t.text,
                                             to:t.to_user,
                                        created:t.created_at
                                    });
                        self.tweetst.add(tweet);
                        var u = new Tweeter({username:t.from_user,
                                                   id: t.from_user_id,
                                         profileImage: t.profile_image_url
                                    });
                        var addUser = self.conversants.noDupeAdd(u);            
                    }
                    console.log('t twts.lngth '+self.tweetst.length);
                    console.log('is boo? '+test);
                    console.log('t count.lngth '+count);
                    cb();
                }
            });
        };
        function checkExtra () {
            console.log('checkExtra called');
            if ( count > 99) {
                count = 0;
                getTweets(self.getUrlToExtra(), checkExtra);
            }
            else {
                count = 0;
                self.renderReady.called.call(self);
            }
        }
        getTweets(this.urlTo, checkExtra);
    },
    fetchFrom: function() {
        console.log('fetchFrom called');
        var self = this,
           count = 0;
        var getTweets = function (url, cb) {
            $.ajax({
                url: url,
                dataType: 'jsonp',
                error: function(error) {
                    console.log(error);
                },
                success: function(data) {
                    count = data.results.length;
                    console.log('jsf count '+count);
                    data.results.forEach(function(t) {
                        var tweet = new Tweet({user:t.from_user,
                                             id: t.from_user_id,
                                      isPrimary: true,
                                       entities:t.entities,
                                            geo:t.geo,
                                           text:t.text,
                                             to:t.to_user,
                                        created:t.created_at
                                    });
                        self.tweetsf.add(tweet);
                    });
                    count = data.results.length;
                    console.log('f twts.lngth '+self.tweetsf.length);
                    console.log('f count.lngth '+data.results.length);
                    cb();
                }
            });
        };
        var checkExtra = function() {
            console.log('checkExtra called');
            if ( count > 99) {
                count = 0;
                getTweets(self.getUrlFromExtra(), checkExtra);
            }
            else {
                count = 0;
                self.renderReady.called.call(self);
            }
        };
        getTweets(this.urlFrom, checkExtra);
    },
    renderReady: (function() {
        var returned = 0;
        return ({called: function () {
            var self = this;
            console.log('renderReady called '+returned+'-'+new Date().getTime());
                if (returned === 0) {
                    returned = 1;
                }
                else {
                    this.tweets.forEach(function(tweet) {
                        self.addTweetView(tweet);
                    });
                    this.setConversantCount();
                    console.log('rr length '+this.conversantCount);
                    console.log('tww length '+this.tweets.length);
                    var cview = new ConvoView({model:this});
                    console.log(cview.render().el);
                    $('#convos-list').append(cview.render().el);
                    returned = 0;
                }
            }
        });
    })(),
    getAllTweets: function() {
        this.fetchTo(),
        this.fetchFrom();
    }
});

var Convos = Backbone.Collection.extend({
    model: Convo
});

var Tweets = Backbone.Collection.extend({
    model: Tweet,
    comparator: function(tweet) {
        return tweet.get('created');
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
            return true;
        }
        return false;
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
        console.log('convoview inited');
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
        "click #searchSubmit": "addConvo"
    },
    initialize: function() {
        this.convos = new Convos();
        this.render();
    },
    render: function() {
    },
    addConvo: function (e) {
        console.log('getConvo called');
        e.preventDefault();
        var search = $('#search-field');
        var term = search.val();
        console.log(term);
        search.val('');
        var ul = $('<ul></ul>')
                  .attr('id', term+'-convos');
        console.log(ul);
        $('#convo-box').append(ul);
        var convo = new Convo({primary:term});
        this.convos.add(convo);
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

