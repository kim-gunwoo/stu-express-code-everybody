const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../models/template.js");

router.get("/create", (req, res) => {
    const title = "WEB - create";
    const list = template.list(req.list);
    const body = `<form action="/topic/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p><input type="submit"></p>
                  </form>`;
    const control = "";
    const html = template.HTML(title, list, body, control);
    res.send(html);
});

router.post("/create_process", (req, res) => {
    const post = req.body;
    const title = post.title;
    const description = post.description;
    fs.writeFile(`data/${title}`, description, "utf8", (err) => {
        res.redirect(`/topic/${title}`);
    });
});

router.get("/update/:pageId", (req, res) => {
    const filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
        const title = req.params.pageId;
        const list = template.list(req.list);
        const body = `<form action="/topic/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p><textarea name="description" placeholder="description">${description}</textarea></p>
                        <p><input type="submit"></p>
                      </form>`;
        const control = `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`;
        const html = template.HTML(title, list, body, control);
        res.send(html);
    });
});

router.post("/update_process", (req, res) => {
    const post = req.body;
    const id = post.id;
    const title = post.title;
    const description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, (error) => {
        fs.writeFile(`data/${title}`, description, "utf8", (err) => {
            res.redirect(`/topic/${title}`);
        });
    });
});

router.post("/delete_process", (req, res) => {
    const post = req.body;
    const id = post.id;
    const filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, (error) => {
        res.redirect("/");
    });
});

router.get("/:pageId", (req, res, next) => {
    const filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
        if (err) {
            next(err);
        }
        const title = req.params.pageId;
        const sanitizedTitle = sanitizeHtml(title);
        const sanitizedDescription = sanitizeHtml(description, {
            allowedTags: ["h1"],
        });
        const list = template.list(req.list);
        const body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
        const control = `<a href="/topic/create">create</a> <a href="/topic/update/${sanitizedTitle}">update</a>
                            <form action="/topic/delete_process" method="post">
                                <input type="hidden" name="id" value="${sanitizedTitle}">
                                <input type="submit" value="delete">
                            </form>`;
        const html = template.HTML(sanitizedTitle, list, body, control);
        res.send(html);
    });
});

module.exports = router;
