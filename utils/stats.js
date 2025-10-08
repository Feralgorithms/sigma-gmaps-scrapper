function percent(data,filter){ return ((data.filter(filter).length/data.length)*100).toFixed(1); }

module.exports = { percent };
