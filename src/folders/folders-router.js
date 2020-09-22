const express = require("express");
const xss = require("xss");
const FoldersService = require("./folders-service");
const path = require("path");

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = (folder) => ({
  id: folder.id,
  title: xss(folder.title),
});

foldersRouter
  .route("/")
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get("db"))
      .then((folders) => {
        res.json(folders);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const newFolder = { title };
    if (newFolder == null) {
      return res.status(400).json({
        error: { message: "Missing folder title in request body" },
      });
    }
    newFolder.title = title;
    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then((folder) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route("/:folderId")
  .all((req, res, next) => {
    FoldersService.getById(req.app.get("db"), res.params.folderId)
      .then((folder) => {
        if (!folder) {
          return res.status(404).json({
            error: { message: "Folder doesn't exist" },
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    FoldersService.getById(knexInstance, req.params.folderId);
    res.json(serializeFolder(folder));
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get("db"), req.params.folderId)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const folderToUpdate = { title };

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if (!title) {
      return res.status(400).json({
        error: {
          message: `Request body must contain a title`,
        },
      });
    }

    FoldersService.updateFolder(
      req.app.get("db"),
      req.params.folderId,
      folderToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;
