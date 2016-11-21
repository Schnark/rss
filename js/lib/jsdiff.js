/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *  Modified again by Schnark: quick and dirty and surprisingly often working HTML diff
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 */

util.diff = (function () {

//this function is based on the original:
function basicDiff (o, n) {
	var out = diff(o.split(/(<.*?>|\b)/), n.split(/(<.*?>|\b)/)), stream = [], i, j;
	if (out.n.length === 0) {
		for (i = 0; i < out.o.length; i++) {
			stream.push([out.o[i], -1]);
		}
	} else {
		if (out.n[0].text == null) {
			for (i = 0; i < out.o.length && out.o[i].text == null; i++) {
				stream.push([out.o[i], -1]);
			}
		}

		for (i = 0; i < out.n.length; i++) {
			if (out.n[i].text == null) {
				stream.push([out.n[i], 1]);
			} else {
				stream.push([out.n[i].text, 0]);
				for (j = out.n[i].row + 1; j < out.o.length && out.o[j].text == null; j++ ) {
					stream.push([out.o[j], -1]);
				}
			}
		}
	}

	i = 0;
	while (i < stream.length - 1) {
		if (!stream[i][0]) {
			stream.splice(i, 1);
			continue;
		}
		if (stream[i][1] === stream[i + 1][1]) {
			stream[i][0] += stream[i + 1][0];
			stream.splice(i + 1, 1);
			continue;
		}
		i++;
	}
	return stream;
}

function htmlDiff (o, n) {
	var stream = basicDiff(o, n), pre, post, text;
	for (i = 0; i < stream.length; i++) {
		pre = ['<del>', '', '<ins>'][stream[i][1] + 1];
		post = ['</del>', '', '</ins>'][stream[i][1] + 1];
		text = stream[i][0].replace(/<([a-zA-Z]*).*?>/g, function (all, tag) {
			return ['img', 'hr', 'br'].indexOf(tag.toLowerCase()) === -1 ? post + all + pre : all;
		});
		stream[i] = pre + text + post;
	}
	return stream.join('').replace(/<\/del><del>/g, '').replace(/<\/ins><ins>/g, '').replace(/<del><\/del>/g, '').replace(/<ins><\/ins>/g, '');
}

//this function is just copied from the original:
function diff( o, n ) {
  var ns = new Object();
  var os = new Object();
  
  for ( var i = 0; i < n.length; i++ ) {
    if ( ns[ n[i] ] == null )
      ns[ n[i] ] = { rows: new Array(), o: null };
    ns[ n[i] ].rows.push( i );
  }
  
  for ( var i = 0; i < o.length; i++ ) {
    if ( os[ o[i] ] == null )
      os[ o[i] ] = { rows: new Array(), n: null };
    os[ o[i] ].rows.push( i );
  }
  
  for ( var i in ns ) {
    if ( ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1 ) {
      n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
      o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
    }
  }
  
  for ( var i = 0; i < n.length - 1; i++ ) {
    if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null && 
         n[i+1] == o[ n[i].row + 1 ] ) {
      n[i+1] = { text: n[i+1], row: n[i].row + 1 };
      o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
    }
  }
  
  for ( var i = n.length - 1; i > 0; i-- ) {
    if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null && 
         n[i-1] == o[ n[i].row - 1 ] ) {
      n[i-1] = { text: n[i-1], row: n[i].row - 1 };
      o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
    }
  }
  
  return { o: o, n: n };
}

return htmlDiff;
})();