import { FilterQuery, Query, SortOrder } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  //searching
  search(searchableFields: string[]) {
    if (this?.query?.searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          field =>
          ({
            [field]: {
              $regex: this.query.searchTerm,
              $options: 'i',
            },
          } as FilterQuery<T>)
        ),
      });
    }
    return this;
  }

  //filtering
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'sort', 'page', 'limit', 'fields'];
    excludeFields.forEach(element => delete queryObj[element]);

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }


  //sorting
  sort() {
    let sort = (this?.query?.sort as string[]) || ['-createdAt']; // Default sorting by createdAt in descending order.

    // Create an array to store the sorting fields in tuple format.
    const sortArray: [string, SortOrder][] = [];

    // Loop over the provided sort fields
    sort.forEach(field => {
      // Trim the field and check if it starts with "-" (indicating descending)
      const isDescending = field.trim().startsWith('-');
      const fieldName = isDescending ? field.slice(1) : field;

      // Push the field name and sort order as a tuple to the sortArray
      sortArray.push([fieldName, isDescending ? 'desc' : 'asc']);
    });

    // Apply the sorting using the sortArray
    this.modelQuery = this.modelQuery.sort(sortArray);

    return this;
  }

  //pagination
  paginate() {
    let limit = Number(this?.query?.limit) || 10;
    let page = Number(this?.query?.page) || 1;
    let skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  // fields filtering
  //"fields": "name,email,location, ...."
 fields() {
  let fields =
    (this?.query?.fields as string)?.split(',').join(' ') || '-__v';

  // Exclude the password field explicitly
  if (!fields.includes('password')) {
    fields = fields + ' -password'; // Add `-password` to the projection string to exclude it
  }

  this.modelQuery = this.modelQuery.select(fields);

  return this;
}


  //populating
  populate(populateFields: string[], selectFields: Record<string, unknown>) {
    this.modelQuery = this.modelQuery.populate(
      populateFields.map(field => ({
        path: field,
        select: selectFields[field],
      }))
    );
    return this;
  }

  //pagination information
  async getPaginationInfo() {
    const total = await this.modelQuery.model.countDocuments(
      this.modelQuery.getFilter()
    );
    const limit = Number(this?.query?.limit) || 10;
    const page = Number(this?.query?.page) || 1;
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      limit,
      page,
      totalPage,
    };
  }
}

export default QueryBuilder;
