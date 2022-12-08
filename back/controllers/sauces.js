const Sauce = require("../models/sauces");
const fs = require("fs");

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce ajoutée" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        //truthy contient bien une modification d'image
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      } //falsy ne contient que le body sans la modif d'image
    : {
        ...req.body,
      };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Vous n'êtes pas autorisé à modifier cette sauce." });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce modifié" }))
          .catch((error) => res.status(401).json({ error }));
      });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Vous n'êtes pas autorisé à supprimer cette sauce." }); // Unauthorized
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimé" });
            })
            .catch((error) => res.status(401).json({ error })); // Unauthorized
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.likeDislike = (req, res, next) => {
  const like = req.body.like;
  // Si l'user like
  if (like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id }
    )
      .then(() => res.status(200).json({ message: "Vous aimez cette sauce" }))
      .catch((error) => res.status(400).json({ error })); // Bad Request
    // Sinon si l'user dislike
  } else if (like === -1) {
    Sauce.updateOne(
      { _id: req.params.id },
      { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id }
    )
      .then(() => res.status(200).json({ message: "Vous n'aimez pas cette sauce" }))
      .catch((error) => res.status(400).json({ error })); // Bad Request
    // Sinon l'user annule le like
  } else {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.indexOf(req.body.userId) !== -1) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Vous n'aimez plus cette sauce" }))
            .catch((error) => res.status(400).json({ error })); // Bad Request
        }
        // Sinon si l'user annule le dislike
        else if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Vous aimerez peut-être cette sauce à nouveau" }))
            .catch((error) => res.status(400).json({ error })); // Bad Request
        }
      })
      .catch((error) => res.status(400).json({ error })); // Bad Request
  }
};
