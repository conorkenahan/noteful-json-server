const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("noteful_folders");
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into("noteful_folders")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from("noteful_folders").select("*").where("id", id).first();
  },
  deleteArticle(knex, id) {
    return knex("noteful_folders").where({ id }).delete();
  },
  updateArticle(knex, id, newArticleFields) {
    return knex("noteful_folders").where({ id }).update(newArticleFields);
  },
};
