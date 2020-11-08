const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const input = fs.readFileSync(path.join(__dirname, 'input', 'bookmarks_SQLite.orig.csv'), { encoding: 'utf-8' });
const csv = Papa.parse(input, { header: true });
// console.log(bookmarks);
let bookmarks = { 'Bookmarks Menu': { entries: [] } };
let unixDate = Math.floor(new Date().getTime() / 1000) - 3600;

csv.data
  .filter(d => !d.URL && d.Folder && d.Title)
  .forEach(d => {
    if(bookmarks['Bookmarks Menu'][d.Folder]) {
      bookmarks['Bookmarks Menu'][d.Folder][d.Title] = {entries: []};
      return;
    }
    if(!bookmarks[d.Folder]) {
      bookmarks[d.Folder] = {};
    }
    bookmarks[d.Folder][d.Title] = {entries: []};
  });


csv.data
  .filter(d => d.URL && d.Folder && d.Title)
  .map(d => {
    if(d.Folder === 'Other Bookmarks') {
      d.Folder = 'Bookmarks Menu';
    }
    return d;
  })
  .forEach(d => getBookmarkMenu(bookmarks, d.Folder).entries.push(d));


let result = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>

<DL><p>
`;

Object.entries(bookmarks)
  .forEach(entry => printBookmarks(1, entry))

result += '\n</DL>';
fs.writeFileSync(path.join(__dirname, 'output', 'bookmarks.html'), result, { encoding: 'utf-8' });

function getBookmarkMenu(bookmarks, name) {
  if(bookmarks[name]) {
    return bookmarks[name];
  }
  return Object.entries(bookmarks)
    .filter(([key]) => key !== 'entries')
    .reduce((acc, [key,value]) => acc || getBookmarkMenu(value, name), null);
}
function printBookmarks(level, [, content]) {
  const spaces = ' '.repeat(4 * level);
  Object.entries(content)
  .filter(([key]) => key !== 'entries')
  .forEach(([key, value]) => {
    result += `${spaces}<DT><H3 ADD_DATE="${unixDate}" LAST_MODIFIED="${unixDate}">${key}</H3>\n${spaces}<DL><p>\n`;
    unixDate++;
    printBookmarks(level + 1, [key, value]);
    result += `${spaces}</DL><p>\n`;
  });
  content.entries.forEach(e => {
    result += `${spaces}<DT><A HREF="${e.URL}" ADD_DATE="${unixDate}" LAST_MODIFIED="${unixDate}">${e.Title}</A>\n`
    unixDate++;
  });
}
