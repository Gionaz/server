import Mongoose from "mongoose";
import { find, update } from "./database";
import { reUploadImage, saveImages } from "./helper";
import { ImageProps } from "./types";
import moment from "moment";
import axios from "axios";
import UsersModule from './modules/users'
const imageFormats = ["jpeg", "jpg", "webp", "JPG", "png"];

export const getUserImages = async () => {
  const extensions = ["jpg", "webp", "jpeg", "png"];
  const regex = extensions.join("|");
  let users: any = await find({
    table: "Users",
    qty: "find",
    query: {
      image: {
        $ne: null,
        $exists: true,
        $regex: regex,
      },
    },
    project: {
      image: 1,
      _id: 1
    },
  });
  users = users.filter((a: any) => !a.image.includes("scontent"));
  let errorImages: any = []
  // reUploadImage(
  //   {
  //     imgUrl: 'https://anthology-prod-backend.s3.amazonaws.com/profile_pic/226/2021-05-21-02-08/img1952.274.png',
  //     _id: '648b09e95b5387b815a9fa13',
  //     folder: 'profilePIC',
  //     ext: 'png'
  //   }
  // ).then((resp) => {
  //   console.log(resp)
  // }).catch((e) => {
  //   console.log(e)
  // })
  console.log(users.length)
  for (let index = 0; index < users.length; index++) {
    const { image, _id } = users[index];
    // console.log(image);
    let splittedImage = image.split(".")
    const ext: string = splittedImage[splittedImage.length - 1]
    // console.log(extension)
    let folder = "profilePIC"

    reUploadImage({
      imgUrl: image, _id, ext, folder
    }).then(async (reUploadedPic: any) => {
      console.log(typeof (reUploadedPic))
      if (typeof (reUploadedPic) == 'string' && reUploadedPic.startsWith("https://")) {
        const updatedProfPic = await update({
          table: "Users",
          qty: "updateOne",
          query: {
            _id, //_id:_id
          },
          update: { $set: { image: reUploadedPic } }
        })
        console.log({ index })
      }
    })
      .catch((error) => {
        errorImages = [...errorImages, image]
        if (index < users.length - 1)
          console.log(errorImages)
        console.error("Error uploading image:", error);
      });


  }
};

export const getPortfolioImages = async () => {
  const portfolios: any = await find({
    table: "SocialFeeds",
    qty: "find",
    query: {
      "media.image": {
        $exists: true,
        $ne: null,
      },
    },
    project: {
      media: 1,
    },
  });
  const portfolioImages = portfolios
    .map((a: any) => a.media.map((b: any) => b.image))
    .flat();
  for (let index = 0; index < portfolioImages.length; index++) {
    const portfolioImage = portfolioImages[index];
    // console.log(portfolioImage);
    let _id = new Mongoose.Types.ObjectId().toString();
    // const newUploads: any = reUploadImage(portfolioImage, _id, imageFormats);
    // console.log(newUploads)
  }
};


export const deleteAccounts = async () => {
  let accounts = [
    "002009.4c0a6e3ebf444f73ab2fa2baa6542b81.1204@anthology-apple-user.com",
    "tau.raylockwood.1645822458176@gmail.com",
    "tau.elialtithora.1645819819460@gmail.com",
    "tau.kellycooper.1645825218094@gmail.com",
    "tau.irismitchell.1645803247881@gmail.com",
    "tau.owenaltithor.1645819819461@gmail.com",
    "tau.viviannedry.1663861396972@gmail.com",
    "tau.bennedry.1663861396973@gmail.com",
    "tau.alansidhu.1645807780512@gmail.com",
    "z-ziqmd5@developermail.com",
    "tau.velociraptre.1645805317496@gmail.com",
    "chinnu80553444@gmail.com",
    "tau.johnlockwood.1645822458177@gmail.com",
    "tau.nickaltithor.1645819819467@gmail.com",
    "tau.robertgrady.1645814430192@gmail.com",
    "tau.timwu.1649193034133@gmail.com",
    "tau.tyrannosausi.1645807780513@gmail.com",
    "tau.simonrex.1645805317491@gmail.com",
    "sales@anthology-us.com",
    "apple_john@anthology-us.com",
    "admin.test@yopmail.com",
    "contact@anthology-us.com",
    "zcw20381@zcrcd.com",
    "shireentarly.313714@hotmail.com",
    "shireentarly.313714@gmail.com",
    "obaratully.681903@gmail.com",
    "shireensand.665773@gmail.com",
    "rhaegarbaelish.385351@gmail.com",
    "tapps02@gmail.com",
    "tapps012@gmail.com",
    "tapps0123@gmail.com",
    "business.stefanmajiros@gmail.com",
    "145078524765077@yopmail.com",
    "145074321432164@yopmail.com",
    "theofficialcocoa@gmail.com",
    "team@kanopylabs.com",
    "hdaly1@stevens.edu",
    "hcd36@cornell.edu",
    "hayden@kanopylabs.com",
    "lyzddcoely_1642012326@tfbnw.net",
    "jerseygrassandgarden@gmail.com",
    "aakash+1@livefurnish.com",
    "aakash@livefurnish.com",
    "000768.e4457fda74b24cc2b7bdc28580422a01.1437@anthology-apple-user.com",
    "001885.30a31c1a43b147fda32931b857bab35f.0228@anthology-apple-user.com",
    "ilyas@aalasolutions.com",
    "geogatedproject1185@gmail.com",
    "geogatedproject1186@gmail.com",
    "geogatedproject1323@gmail.com",
    "geogatedproject1322@gmail.com",
    "1095752474493358@yopmail.com",
    "test@yopmail.com",
    "rohit.yadav+1@kiwitech.com",
    "001475.6fe7635ba22f4f368c4bcc0f00a9469a.2231@anthology-apple-user.com",
    "000860.0b9c4c635a5545ecb155bd52fcf25228.0548@anthology-apple-user.com",
    "000055.7bd3447e7ca94a80885f4e1a3c856b58.2316@anthology-apple-user.com",
    "14702204175781@yopmail.com",
    "32302204307542@yopmail.com",
    "22502204693350@yopmail.com",
    "suraj@yopmail.com",
    "n@yopmail.com",
    "rahul123@yopmail.com",
    "266264475470828@yopmail.com",
    "000895.6b2d28fb6fb6464d88ddd910e563abbf.1901@anthology-apple-user.com",
    "mike777@yopmail.com",
    "henna.sondh+9@kiwitech.com",
    "001035.fde16d9e8ef4424d8f24bb74a5745c4c.1901@anthology-apple-user.com",
    "25802200683070@yopmail.com",
    "2867080940237758@yopmail.com",
    "hsondh@yopmail.com",
    "22302200305356@yopmail.com",
    "henna12345@yopmail.com",
    "ritesh.mishra15@yopmail.com",
    "rohitsharma@yopmail.com",
    "pxsiofmngr_1574354973@tfbnw.net",
    "jkuuprjrje_1617034974@tfbnw.net",
    "osbojlkljv_1565969437@tfbnw.net",
    "fettkaijxf_1567689183@tfbnw.net",
    "vwduduetmo_1574417470@tfbnw.net",
    "yadav@yopmail.com",
    "2809585072622218@yopmail.com",
    "job@yopmail.com",
    "devin@yopmail.com",
    "preeti.singh+12@kiwitech.com",
    "001130.79186d7d12554699b81c8d0de9ff9977.2020@anthology-apple-user.com",
    "kwtestteam@gmail.com",
    "dawnciolino@bmail.com",
 
  ]
  const users: any = await find({
    table: "Users",
    qty: 'find',
    query: {
      email: { $in: accounts }
    },
    project: { _id: 1 }
  })
  let userIds = users.map((a: any) => a._id.toString())
  userIds.forEach((userId: any) => {
    UsersModule({
      res: null,
      apiData: {
        userId,
        action:"deleteAccount"
      }
    })
  })


}