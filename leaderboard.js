// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");
Redis = new Meteor.RedisCollection("redis");

if (Meteor.isClient) {
  Template.leaderboard.helpers({
    players: function () {
      return Redis.matching("players*");
      // return Players.find({}, { sort: { score: -1, name: 1 } });
    },
    selectedName: function () {
      // var player = Players.findOne(Session.get("selectedPlayer"));
      var selectedPlayer = Session.get("selectedPlayer");
      var player = Redis.get(selectedPlayer);

      return player && selectedPlayer.split("::")[1];
    }
  });

  Template.leaderboard.events({
    'click .inc': function () {
      // Players.update(Session.get("selectedPlayer"), {$inc: {score: 5}});
      Redis.incrby(Session.get("selectedPlayer"), 5);
    }
  });

  Template.player.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : '';
    },
    getName: function (id) {
      return id.split("::")[1];
    },
  });

  Template.player.events({
    'click': function () {
      Session.set("selectedPlayer", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
                   "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"];
      _.each(names, function (name) {
        Players.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }

    if (Redis.matching("players*").count() === 0) {
      var names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
                   "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"];
      _.each(names, function (name) {
        // var score = Math.floor(Random.fraction() * 10) * 5;
        var score = 0;
        console.log(name);
        score = Math.floor(Random.fraction() * 10) * 5;
        Redis.set("players::" + name, score);
      });
    }
  });
}
