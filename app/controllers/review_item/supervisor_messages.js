import { alias } from "@ember/object/computed";
import { inject as controller } from "@ember/controller";
import MessagesBaseController from "shared-goodcity/controllers/messages_base";

export default MessagesBaseController.extend({
  review_item: controller(),
  item: alias("review_item.model"),
  isPrivate: true
});
