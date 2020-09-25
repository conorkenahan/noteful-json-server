const express = require("express");
const xss = require("xss");
const NotesService = require("./notes-service");
const path = require("path");
const foldersRouter = require("../folders/folders-router");

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = (note) => ({
  id: note.id,
  title: xss(note.title),
  content: xss(note.content),
  folderId: note.folderid,
  modified: note.modified,
});

notesRouter
  .route("/")
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get("db"))
      .then((notes) => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, folderId, content } = req.body;
    const newNote = { title, folderid: folderId, content };

    for (const [key, value] of Object.entries(newNote))
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` },
        });
      }

    NotesService.insertNote(req.app.get("db"), newNote)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route("/:noteId")
  .all((req, res, next) => {
    NotesService.getById(req.app.get("db"), req.params.noteId)
      .then((note) => {
        if (!note) {
          return res.status(404).json({
            error: { message: "Note doesn't exist" },
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    NotesService.getById(knexInstance, req.params.noteId).then((note) =>
      res.json(serializeNote(note))
    );
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get("db"), req.params.noteId)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content, folderId } = req.body;
    const noteToUpdate = { title, content, folderid: folderId };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (!title) {
      return res.status(400).json({
        error: {
          message: `Request body must contain a title`,
        },
      });
    }

    NotesService.updateNote(req.app.get("db"), req.params.noteId, noteToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
