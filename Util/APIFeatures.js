class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const { sort, fields, limit, page, ...queryObj } = this.queryString;
    let queryStr = JSON.stringify(queryObj);
    //IF there will be fields such as page, sort, limit, fields- their values will be stored directly
    // in constants page, sort, limit and fields

    //1b) Advance filtering to replace  for e.g gte with $gte
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  //2) Sorting
  sort() {
    if (this.queryString.sort) {
      const sortValues = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortValues);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  //3) fields
  fields() {
    if (this.queryString.fields) {
      const fieldValues = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldValues);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  //4) Skip and Limit (Pagination)
  paginate() {
    const pageValue = this.queryString.page * 1 || 1; //we already save the value of req.query.page in constant 'page'in start
    const limitValue = this.queryString.limit * 1 || 100;

    // console.log(pageValue, limitValue);

    const skip = limitValue * (pageValue - 1);

    if (skip >= this.query.countDocuments) {
      throw new Error('This page does not exist');
    } else {
      this.query = this.query.skip(skip).limit(limitValue);
    }
    return this;
  }
}

module.exports = APIFeatures;
