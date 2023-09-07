// @ts-ignore
import SneaksAPI from 'sneaks-api';
import lodash from 'lodash'
import Products from '../database/models/products'

const sneaks = new SneaksAPI();
export default ({
    res,
    data
}: any) => {
    const { action } = data
    switch (action) {
        case 'getSneakersData':
            sneaks.getMostPopular(100, (err: any, products: any[]) => {
                if (err)
                    console.log("err")
                else {
                    const newArray = products.map(product => {
                        let {
                            shoeName, brand, styleID, silhoutte, make,
                            colorway, retailPrice, thumbnail, releaseDate,
                            description, imageLinks, urlKey, resellLinks,
                            goatProductId, resellPrices
                        } = product
                        return {
                            a: 'c',
                            shoeName,
                            styleID,
                            brand,
                            silhoutte,
                            make,
                            colorway, retailPrice, thumbnail, releaseDate,
                            description, imageLinks, urlKey, resellLinks,
                            goatProductId, resellPrices
                        };
                    });
                    Products.insertMany(newArray).then((resp) => {
                        console.log({ resp })
                    }).catch((x) => {
                        console.log(x)
                    })
                }
            })
            break;

        default:
            break;
    }
}