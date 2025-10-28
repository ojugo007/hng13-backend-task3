    
    function getGdpEstimate(pop, rate) {
      const min = Math.ceil(1000);
      const max = Math.floor(2000);
      const randomValue = Math.floor(Math.random() * (max - min + 1) + min);
      return (pop * randomValue) / rate;
    }

    module.exports = {getGdpEstimate}