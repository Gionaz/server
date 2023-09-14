import { find, save, update } from "../database";
import { Api } from "../helper";
import Notifications from "../database/models/notifications";

export default ({ data, res }: any) => {
  const { action } = data;
  switch (action) {
    case "addOrder":
      save({
        table: "orders",
        data: data.order,
      }).then((order: any) => {
        const newNotification: any = new Notifications({
            sender: data.userId,
            message: "Your order has been placed successfully",
            notificationType: "orderCreation"
        })
        newNotification.save().then((resp: any) => {
            Api(res, resp)
        })
        Api(res, order);
      });
      break;

    case "updateOrder":
        update({
            table: 'orders',
            qty: 'updateOne',
            query: {
                _id: data.orderId
            },
            update:{
                $set:data
            }
        }).then((resp: any) => {
            const updateNotification: any = new Notifications({
                sender: data.userId,
                message: "Your order has been updated successfully",
                notificationType: "orderUpdate"
            })
            updateNotification.save().then(() => {
                Api(res, resp)
            })
            Api(res, resp)
        })
        break

      /*case "getOrder":
      //check in the db if the product is available
      find({
        table: "ProductsToSell",
        qty: "findOne",
        query: {
          $or: [{ _id: data.productId }, { goatProductId: data.goatProductId }],
        },
        project: {
          _id: 1,
          goatProductId: 1,
        },
      }).then((order: any) => {
        if (!order) {
          save({
            table: "Orders",
            data: {
              ...data,
            },
          }).then((order: any) => {
            Api(res, order);
          });
        }
      });
      break;*/
  }
};