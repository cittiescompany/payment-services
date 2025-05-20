import axios from 'axios';

const Bills = {

  // BILLS
  async checkMeter(vendData) {
    try {
      const {meter, vendType, disco, vertical} = vendData
       const url = `${process.env.BUYPOWER_BASE_URL}/check/meter?meter=${meter}&disco=${disco}&vendType=${vendType}&vertical=${vertical}&orderId=${true}`
       let config = {
        method: "get",
        maxBodyLength: Infinity,
        // Build the URL for the API request with query parameters
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.BUYPOWER_TOKEN}`,
        },
      }
      let {data} = await axios.request(config);
      return data
    } catch (error) {
      return error?.response.data
    }
  },
  async  checkDisco() {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.BUYPOWER_BASE_URL}/discos/status`,
        headers: {
          Authorization: `Bearer ${process.env.BUYPOWER_TOKEN}`,
        },
      };
      let {data} = await axios.request(config);
      return data;
    } catch (error) {
      return error.response.data
    }
  },
  async priceList(vendData) {
    try {
      const {vertical, provider} = vendData;
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.BUYPOWER_BASE_URL}/tariff/?vertical=${vertical}&provider=${provider}`,
        headers: {
          Authorization: `Bearer ${process.env.BUYPOWER_TOKEN}`,
        },
      };
      let {data} = await axios.request(config);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },
  async purchaseBill(requestVend) {

    try{

    delete requestVend.narration
    delete requestVend.account_number
    delete requestVend.merchant_id

      let strict = requestVend.vertical.toLowerCase() == "vtu" ?1 :0
      if (requestVend.vertical.toLowerCase() == "vtu" || requestVend.vertical.toLowerCase() == "data") {
        const data = await this.checkMeter({
            "meter":requestVend.meter,
            "vendType":"PREPAID",
            "disco":requestVend.disco,
            "vertical":requestVend.vertical
        })
       requestVend["orderId"] = data?.orderId
      }
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url:`${process.env.BUYPOWER_BASE_URL}/vend?strict=${strict}`,
        
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUYPOWER_TOKEN}`,
        },
        data: requestVend,
      };
       const { data }  = await axios.request(config);
       return data
    } catch (error) {
      return error.response.data
    }
  },

};
export default Bills;
