const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
//const multer = require('multer') replaced bc we added filepond, so deleting it. npm uninstall multer too!
//const path = require('path')
//const { createCipher } = require('crypto') wtf? where did this come from 
const book = require('../models/book')
//const uploadPath = path.join('public',Book.coverImageBasePath)
//const fs = require('fs')

const imageMimeTypes = ['image/jpeg','image/png','image/gif']

// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype) )
//     }
// })

//all books route
router.get('/', async (req,res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title',new RegExp(req.query.title, 'i'))
    }

    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }

    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    try{
        const books = await query.exec()
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
    }
    
})

//new books route
router.get('/new', async (req, res) => {
    renderNewPage(res,new Book())
})

//create books route
//used to say like uploads.cover('single') or something.. bc we're using filepond (sends encoded string instead of image). so got rid of
router.post('/', async (req,res) => {
    //const fileName = req.file != null ? req.file.filename : null
    try{   
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            publishDate: new Date(req.body.publishDate),
            pageCount: req.body.pageCount,
            //coverImageName: fileName,
            description: req.body.description
        })
    
        saveCover(book, req.body.cover)

        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
        //res.redirect(`books`)
    }catch {
        // if(book.coverImageName != null){
        //     removeBookCover(book.coverImageName)
        // }
        
        //rn, we just have it rendering the new pg, if the user doesnt give a title
        //we can run into a situation where, a cover img is on our server & no title
        //we need toadd logic to get rid of that. do above
        //actually we changed to filepond, so... unrelated now
        renderNewPage(res,book,true)
    }

})

function saveCover(book,coverEncoded){
    if(coverEncoded == null){
        return
    }
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}


// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath,fileName), err => {
//         if (err){
//             console.error(err)
//         }
//     })
// }

//show book route
router.get('/:id', async (req,res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show',{book:book})
    }catch{
        res.redirect('/')
    }
})

//edit books route
router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        renderEditPage(res,book)
    }catch{
        res.redirect('/')
    }

    
})

async function renderNewPage(res,book,hasError = false){
    renderFormPage(res,book,'new',hasError)
    // try{
    //     const authors = await Author.find({})
    //     const params = {
    //         authors: authors,
    //         book: book
    //     }
    //     //const book = new Book()
    //     if(hasError){
    //         params.errorMessage = 'error creating book'
    //     }

    //     res.render('books/new',params)

    // }catch{
    //     res.redirect('/books')
    // }
}

async function renderEditPage(res,book,hasError = false){
    renderFormPage(res,book,'edit',hasError)
    // try{
    //     const authors = await Author.find({})
    //     const params = {
    //         authors: authors,
    //         book: book
    //     }
    //     //const book = new Book()
    //     if(hasError){
    //         params.errorMessage = 'error creating book'
    //     }

    //     res.render('books/edit',params)

    // }catch{
    //     res.redirect('/books')
    // }
}

async function renderFormPage(res,book,form,hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }

        if (hasError){
            if(form ==='edit'){
                params.errorMessage = 'error updating book'
            }else{
                params.errorMessage = 'error creating book'
            }
        }


        res.render(`books/${form}`,params)

    }catch{
        res.redirect('/books')
    }
}

//update books route
router.put('/:id', async (req,res) => {
    //const fileName = req.file != null ? req.file.filename : null
    let book

    

    try{   
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover != null && req.body.cover != ''){
            saveCover(book,req.body.cover)
        }
        await book.save()
        res.redirect(`books/${book.id}`)
        
    }catch {
        if(book != null){
            renderEditPage(res,book,true)
        }else{
            res.redirect('/')
        }
        
    }

})

//delete book page
router.delete('/:id',async (req,res) => {
    let book
    try{
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    }catch{
        if(book != null){
            res.render('books/show',{book:book,errorMessage:'couldnt remove book'})
        }else{
            res.redirect('/')
        }
    }
})

module.exports = router