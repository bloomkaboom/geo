const convertToArrSort = async (str_sort) => {
    let sort = [];
    if (str_sort){ 
      let strSort = str_sort;
      let arrTempSort = await strSort.split(','); //output: ['item1.ASC', 'item2.ASC', 'item3.DESC'] 
      arrTempSort.forEach(item => {
        sort.push(item.split('.')); //output: [['item1', 'ASC'], ['item2', 'ASC'], ['item3', 'DESC']]
      });  
    }
    return sort; 
  }

  module.exports = convertToArrSort;