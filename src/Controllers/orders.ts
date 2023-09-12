import { find, save, update } from "../database";
import { Api } from "../helper";

export default ({ data, res }: any) => {
  const { action } = data;
  switch (action) {
    case "addOrder":
      save({
        table: "orders",
        data: data.order,
      }).then((order: any) => {
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
