import { save, remove, update, find } from "../database";
import { Api } from "../helper";
import { sendTosentry } from "../sentry";
export default async ({ res, apiData }: any) => {
  const table = "Sponsors";
  const { action } = apiData;
  switch (action) {
    case "createSponsor":
      save({
        table,
        data: {
          apiData,
        },
      })
        .then(() => {
          Api(res, {
            message: "Sponsor saved successfully!",
          });
        })
        .catch((e) => {
          sendTosentry("createSponsor", e);
        });
      break;
    case "getSponsor":
      try {
        find({
          table,
          qty: "findOne",
          query: {
            _id: apiData.sponsorId,
          },
        })
          .then((sponsor) => {
            if (sponsor) {
              Api(res, {
                message: "Sponsor found",
                sponsor,
              });
            } else {
              Api(res, {
                message: "Sponsor not found",
              });
            }
          })
          .catch((e) => {
            sendTosentry("getSponsor", e);
          });
      } catch (e) {
        sendTosentry("getSponsor", e);
      }
      break;
    case "updateSponsor":
      update({
        table,
        qty: "findOneAndUpdate",
        query: {
          _id: apiData.sponsorId,
        },
        update: {
          $set: { apiData },
        },
      })
        .then(() => {
          Api(res, {
            message: "Sponsor has been updated.",
          });
        })
        .catch((e) => {
          sendTosentry("updateSponsor", e);
        });
      break;
    case "deleteSponsor":
      remove({
        table,
        qty: "findOneAndDelete",
        query: {
          _id: apiData.sponsorId,
        },
      })
        .then(() => {
          Api(res, {
            message: "Sponsor deleted successfully!",
          });
        })
        .catch((e) => {
          sendTosentry("deleteSponsor", e);
        });
      break;
    default:
      break;
  }
};
