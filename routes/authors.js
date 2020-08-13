const express = require('express')
//const author = require('../models/author')
const router = express.Router()

const Author = require('../models/author')
const Book = require('../models/book')

//all authors route
router.get('/', async (req,res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }

    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { 
            authors:authors,
            searchOptions: req.query
        })
    } catch{
        res.redirect('/')
    }

    
})

//new author route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

//create author route
router.post('/', async (req,res) => {
    const author = new Author({
        name: req.body.name
    })

    try{
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
        //res.redirect(`authors`)
    } catch{
        res.render('authors/new',{
            author: author,
            errorMessage: 'Error creating author'
        })
    }


    // author.save((err,newAuthor) => {
    //     if(err){
    //         res.render('authors/new',{
    //             author: author,
    //             errorMessage: 'Error creating author'
    //         })
    //     }else{
    //         //res.redirect(`authors/${newAuthor.id}`)
    //         res.redirect(`authors`)
    //     }

    // })
    
})

//NOTE the get by id route needs to be defined AFTER the new author route
//it reads from the top down, so it would match with /:id first and then take new as the id.
//thats wrong so make it check against /new first, then /:id
router.get('/:id', async (req,res) => {
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    }catch{
        //console.log(err)
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req,res) => {
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author:  author })
    }catch{
        res.redirect('/authors')

    }
    
})

//from a browser you can only do get & post reqs, need a lib for put / delete
//need a lib called method override 
//NEVER use a get to handle deleting, search engines scan to index it on their pages
//and will visit every link and possibly delete everything in ur app!
router.put('/:id', async (req,res) => {
    let author

    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name

        await author.save()
        res.redirect(`/authors/${newAuthor.id}`)
        //res.redirect(`authors`)
    } catch{
        if (author == null){
            res.redirect('/')
        }else{
            res.render('authors/edit',{
                author: author,
                errorMessage: 'Error updating author'
            })
        }
    }
    
})

router.delete('/:id', async (req,res)=>{
    let author

    try{
        author = await Author.findById(req.params.id)
        

        await author.remove()
        //res.redirect(`/authors/${newAuthor.id}`)
        res.redirect(`/authors`)
    } catch{
        if (author == null){
            res.redirect('/')
        }else{
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router