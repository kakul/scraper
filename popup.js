const debounce = (delay, fn) => {
    let timeout
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            fn(...args)
            timeout = null
        }, delay)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const emailRegex =  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
    const emailSet = new Set()
    const scrapeBtn = document.getElementById('scrape-btn')
    const saveBtn = document.getElementById('save-btn')
    const loadBtn = document.getElementById('load-btn')
    const sortBtn = document.getElementById('sort-btn')
    const searchInp = document.getElementById('search-inp')
    const container = document.getElementById('container')
    
    scrapeBtn.addEventListener('click', () => {
        chrome.tabs.executeScript(null, {
            file: 'getHTML.js'
        }, () => {
            if (chrome.runtime.lastError) {
                alert( 'Injection error:' + chrome.runtime.lastError.message)
            }
        })
    })

    saveBtn.addEventListener('click', () => {
        chrome.storage.local.set({'emails': [...emailSet]})
        alert('Saved!')
    })

    loadBtn.addEventListener('click', () => {
        chrome.storage.local.get(['emails'], savedEmails => {
            savedEmails.emails.forEach(email => emailSet.add(email))
            display(emailSet)
        })
    })

    sortBtn.addEventListener('click', () => {
        const sortedSet = [...emailSet].sort()
        display(sortedSet)
    })

    searchInp.addEventListener('keydown', () => {
       search(searchInp.value) 
    })

    const searchEmails = (html) => {
        const emailArr = html.match(emailRegex) || []
        emailArr.forEach(item => emailSet.add(item))
        display(emailSet)
    }

    const search = debounce(1000, value => {
        const regex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + searchInp.value)
        const matched = [...emailSet].filter(item => item.match(regex))
        if (value === '') {
            display(emailSet)
        } else {
            display(matched)
        }
    })

    const display = (emails) => {
        const list = document.createElement('ol')
        let li
        emails.forEach(item => {
            li = document.createElement('li')
            li.innerText = item
            list.appendChild(li)
        })
        container.innerHTML = ''
        container.appendChild(list)
    }

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'getHTML') {
            searchEmails(request.source)     
        }
    })
})
