const NotesService = {
  getAllNotes(knex) {
    return knex.select("*").from("noteful_notes");
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into("noteful_notes")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from("noteful_notes").select("*").where("id", id).first();
  },
  deleteArticle(knex, id) {
    return knex("noteful_notes").where({ id }).delete();
  },
  updateArticle(knex, id, newArticleFields) {
    return knex("noteful_notes").where({ id }).update(newArticleFields);
  },
};
