import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  store: Ember.inject.service(),

  formData: function() {
    return {
      donorConditionId: this.get("model.donorConditionId"),
      donorDescription: this.get("model.donorDescription")
    };
  }.property("model"),

  defaultPackage: Ember.computed.alias('model.packageType'),
  item: Ember.computed.alias('model'),

  displayEditLink: function() {
    return this.get("application.currentRouteName").indexOf("accept") >= 0;
  }.property("application.currentRouteName"),

  isEditing: Ember.computed('item', 'item.donorDescription', 'item.donorCondition', {
    get: function() {
      var item = this.get('item');
      var description = Ember.$.trim(item.get('donorDescription'));
      return !(item.get('donorCondition') && description.length > 0);
    },
    set: function(key, value) {
      return value;
    }
  }),

  itemTypeId: Ember.computed('defaultPackage', {
    get: function() {
      return this.get('defaultPackage.id');
    },
    set: function(key, value) {
      return value;
    }
  }),

  itemTypes: function() {
    return this.get("store").all('package_type').sortBy('name');
  }.property(),

  actions: {
    setEditing: function(value){
      this.set("isEditing", value);
    },

    copyItem: function(){
      var loadingView = this.container.lookup('view:loading').append();
      var _this = this;
      var item = _this.get("model");
      var images = item.get("images");
      var promises = [];

      var newItem = _this.get("store").createRecord("item", {
        offer: item.get('offer'),
        donorCondition: item.get('donorCondition'),
        state: "draft",
        packageType: item.get("packageType"),
        donorDescription: item.get('donorDescription')
      });

      newItem.save()
        .then(() => {
          images.forEach(function(image){
            var newImage = _this.get("store").createRecord('image', {
              cloudinaryId: image.get('cloudinaryId'),
              item: newItem,
              favourite: image.get('favourite')
            });
            promises.push(newImage.save());
          });

          Ember.RSVP.all(promises).then(function(){
            loadingView.destroy();
            _this.transitionToRoute('item.edit_images', newItem);
          });
        });
    },
  }
});
