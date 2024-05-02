/**
 * Embedify v1.114
 */
window.Embedify = (function(window, document, $, undefined)
{
    'use strict';

    var Embedify = {

        sites: { },

        load: function( selector, strict )
        {
            strict = typeof strict === 'undefined' ? false : Boolean( strict );

            $( selector ).each( function() {
                if( $( this ).text() !== $( this ).parent().text() )
                    return;

                var url = decodeURIComponent( $( this ).attr( 'href' ) );

                var match = Embedify.match( url, strict );

                if( match !== '' ) {
                    Embedify.embed( url, match, $( this ).parent() );
                }
            } );
        },

        match: function( url, strict ) {
            var match = '';
            $.each( Embedify.sites, function( name, site ) {
                if( strict && site['isFallback'] ) {
                    return;
                }
                if( site['regex'].test( url ) ) {
                    match = name;
                }
            } );

            return match;
        },

        embed: function( url, siteName, parent ) {
            var html = url.replace( Embedify.sites[siteName]['regex'], Embedify.sites[siteName]['html'] );
            html = Embedify.sites[siteName]['process']( html );

            $( parent ).html( html );
        },

        site: function( name, params )
        {
            if( !( name ) ||
                    !( params['regex'] instanceof RegExp ) ||
                    !( params['html'] ) ) {
                return false;
            }

            Embedify.sites[name] = {
                'name': name,
                regex: params['regex'],
                html: params['html'],
                process: function( html ) {
                    return html;
                },
                isFallback: false
            };
            if( typeof params['process'] === 'function' ) {
                Embedify.sites[name]['process'] = params['process'];
            }
            if( params['isFallback'] ) {
                Embedify.sites[name]['isFallback'] = true;
            }
        },

        scaleToFit: function( element ) {
            /**
             * Based off the algorithm on
             * https://codepen.io/herschel666/blog/scaling-iframes-css-transforms
             */
            var maxWidth = element.width,
                maxHeight = element.height,
                currentStyle = getComputedStyle( element ),
                currentWidth = parseInt( currentStyle.width, 10 ),
                currentHeight = parseInt( currentStyle.height, 10 ),
                scale,
                width,
                height,
                offsetLeft;

            if ( currentWidth >= maxWidth || currentHeight >= maxHeight ) {
                return false;
            }

            /**
             * The required scaling using `Math.pow` to get
             * a safely small enough value.
             */
            scale = Math.min( Math.pow( currentWidth / maxWidth, 1 ),
                            Math.pow( currentHeight / maxHeight, 1 ) );

            /**
             * To get the corresponding width percentage that
             * compensates keeps the width of the shrinking iframe
             * consistent, we have to divide 100 by the scale.
             */
            width = 100 / scale;
            height = currentHeight / scale;

            /**
             * Correct the position of the iframe when
             * changing its width.
             */
            offsetLeft = (width - 100) / 2;

            /**
             * Setting the styles.
             */
            element.setAttribute('style',
                    'height: ' + height + 'px; ' +
                    'max-height: none; ' +
                    'max-width: none; ' +
                    'transform: scale(' + scale + ') ' + 'translate3d(-' + offsetLeft + '%,0,0); ' +
                    'transform-origin: center top; ' +
                    'width: ' + width + '%;'
                    );

            return true;
        }
    };

    return Embedify;

})(window, window.document, jQuery);


/**
 * Embedify Fallbacks
 *
 * Sites (including fallbacks) must be added in order
 * from least specific to most specific, so that more
 * specific regex can always take precedence.
 */
(function(window, document, Embedify, undefined)
{
    // IFrame

    Embedify.site(
        'iframe',
        {
            regex: /(^.*$)/i,
            html: '<div class="embedify-embed embedify-responsive-container">' +
                    '\t<iframe src="$1" frameborder="0" onload="Embedify.scaleToFit( this );" width="640" height="360" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
                    '</div>\n',
            isFallback: true
        }
    );

    // Video

    Embedify.site(
        'video',
        {
            regex: /(.*\.(?:mp4|ogv|webm)$)/i,
            html: '<div class="embedify-embed embedify-responsive-container">\n' +
                    '\t<video width="100%" src="$1" style="margin:auto;" controls></video>\n' +
                    '</div>\n',
            isFallback: true
        }
    );

    // Audio

    Embedify.site(
        'audio',
        {
            regex: /(.*\.(?:flac|m4a|mp3|oga|ogg|wav|weba)$)/i,
            html: '<div class="embedify-embed">\n' +
                    '\t<audio src="$1" style="margin:auto;width:100%;" preload="none" controls></audio>\n' +
                    '</div>\n',
            isFallback: true
        }
    );

    // Image

    Embedify.site(
        'image',
        {
            regex: /(.*\.(?:gif|jpeg|jpg|png)$)/i,
            html: '<div class="embedify-embed">\n' +
                    '\t<img src="$1"/>\n' +
                    '</div>\n',
            isFallback: true
        }
    );

    // PDF

    Embedify.site(
        'pdf',
        {
            regex: /(.*\.(?:pdf)$)/i,
            html: '<div class="embedify-embed" style="max-width: 600px; margin: auto;">' +
                    '\t<div class="embedify-responsive-container" style="padding-bottom: 129.41%;">\n' +
                    '\t<iframe src="https://docs.google.com/viewer?embedded=true&url=$1" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
                    '\t</div>\n' +
                    '</div>\n',
            isFallback: true
        }
    );


})(window, window.document, window.Embedify);


/**
 * Embedify Extensions - Pick 'n' Mix!
 */
(function(window, document, Embedify, undefined)
{

    // Facebook Page Plugin
    // https://developers.facebook.com/docs/plugins/page-plugin/

    Embedify.site(
        'facebook-page',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:facebook\.com\/plugins\/page.php\?)(.*)$/gi,
            html: '<div class="embedify-embed" style="max-height: 600px; margin: auto;">' +
                    '\t<div class="embedify-responsive-container" style="padding-bottom: 200%;">\n' +
                    '\t<iframe src="https://www.facebook.com/plugins/page.php?$1" frameborder="0" scrolling="no"></iframe>\n' +
                    '\t</div>\n' +
                    '</div>\n'
        }
    );

    // Flourish
    // https://help.flourish.studio/article/145-how-to-embed-flourish-charts-in-your-cms
    // https://developers.flourish.studio/embedding/oembed-integration/

    Embedify.site(
        'flourish',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:public\.|app\.|)(?:(?:flourish(?:\.studio|\.com)|flo\.uri\.sh)\/(?:visualisation)\/)(\d+).*/gi,
            html: '<div class="embedify-embed">' +
                    '\t<div id="flourish-$1" class="flourish-embed flourish-chart" data-src="visualisation/$1"></div>\n' +
                    '\t<script>if( typeof window.Flourish === "undefined" ) { window.Flourish = {}; jQuery.ajax( { url: "https://public.flourish.studio/resources/embed.js", dataType: "script", cache: true } ); } else if( window.FlourishLoaded ) { window.Flourish.loadEmbed( document.getElementById( "flourish-$1" ) ); }</script>\n' +
                    '</div>\n'
        }
    );

    // Giphy
    // https://support.giphy.com/hc/en-us/articles/360020330711-How-to-Embed-a-GIF

    Embedify.site(
        'giphy',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:giphy\.com\/(?:embed|gifs)\/)(\w+).*/gi,
            html: '<div class="embedify-embed embedify-responsive-container">' +
                    '\t<iframe src="https://giphy.com/embed/$1" frameborder="0" onload="Embedify.scaleToFit( this );" width="640" height="360" allowFullScreen></iframe>\n' +
                    '</div>\n'
        }
    );

    // Gfycat
    // https://www.gfycat.com/about
    // https://www.gfycat.com/api

    Embedify.site(
        'gfycat',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:gfycat\.com\/(?:\w+\/)*)(\w+).*/gi,
            html: '<div class="embedify-embed embedify-responsive-container js-hover-to-play">\n' +
                    '\t<video loop muted playsinline width="100%" poster="https://thumbs.gfycat.com/$1-poster.jpg" style="margin:auto;">\n' +
                    '\t\t<source src="https://zippy.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t\t<source src="https://fat.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t\t<source src="https://giant.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t\t<source src="https://fat.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '\t\t<source src="https://giant.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '\t\t<source src="https://zippy.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '\t</video>\n' +
                    '</div>\n'
        }
    );

    // Imgur
    // https://help.imgur.com/hc/en-us/articles/204766005-Image-Album-Embed
    // https://api.imgur.com/

    Embedify.site(
        'imgur',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:\w+.|)(?:imgur\.com\/(?:\w+\/)*)(\w+).*/gi,
            html: '<div class="embedify-embed">\n' +
                    '\t<blockquote class="imgur-embed-pub" lang="en" data-id="$1">\n' +
                    '\t\t<a href="https://imgur.com/$1">https://imgur.com/$1</a>\n' +
                    '\t</blockquote>\n' +
                    '\t<script async src="https://s.imgur.com/min/embed.js" charset="utf-8"></script>\n' +
                    '</div>\n'
        }
    );

    // Instagram
    // https://www.instagram.com/developer/embedding/

    Embedify.site(
        'instagram',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:instagr\.am|instagram\.com)\/p\/([\w-]+)\/.*/gi,
            html: '<div class="embedify-embed">' +
                    '\t<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-version="7" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:8px;"> <div style=" background:#F8F8F8; line-height:0; margin-top:40px; padding:50.0% 0; text-align:center; width:100%;"> <div style=" background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURczMzPf399fX1+bm5mzY9AMAAADiSURBVDjLvZXbEsMgCES5/P8/t9FuRVCRmU73JWlzosgSIIZURCjo/ad+EQJJB4Hv8BFt+IDpQoCx1wjOSBFhh2XssxEIYn3ulI/6MNReE07UIWJEv8UEOWDS88LY97kqyTliJKKtuYBbruAyVh5wOHiXmpi5we58Ek028czwyuQdLKPG1Bkb4NnM+VeAnfHqn1k4+GPT6uGQcvu2h2OVuIf/gWUFyy8OWEpdyZSa3aVCqpVoVvzZZ2VTnn2wU8qzVjDDetO90GSy9mVLqtgYSy231MxrY6I2gGqjrTY0L8fxCxfCBbhWrsYYAAAAAElFTkSuQmCC); display:block; height:44px; margin:0 auto -44px; position:relative; top:-22px; width:44px;"></div></div><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/$1/" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">https://www.instagram.com/p/$1</a></p></div></blockquote>\n' +
                    '\t<script async defer src="https://platform.instagram.com/en_US/embeds.js"></script>\n' +
                    '</div>\n'
        }
    );

    // Playspedia
    // http://www.playspedia.com/

    Embedify.site(
        'playspedia',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:playspedia\.com\/(?:\w*\/)*id\/)(\d+).*/gi,
            html: '<div class="embedify-embed" style="max-width: 560px; max-height: 700px; margin: auto;">' +
                    '\t<div class="embedify-responsive-container" style="padding-bottom: 125%">' +
                    '\t\t<iframe src="http://www.playspedia.com/play/embed/id/$1" width="560" height="700" frameborder="0" onload="Embedify.scaleToFit( this );" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
                    '\t</div>\n' +
                    '</div>\n'
        }
    );

    // Scribd
    // https://www.scribd.com/developers

    Embedify.site(
        'scribd',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:scribd\.com)\/(\w+)\/([\d-]+)\/.*/gi,
            html: '<div class="embedify-embed" style="max-height: 600px; margin: auto;">' +
                    '\t<div class="embedify-responsive-container" style="padding-bottom: 77.29%;">\n' +
                    '\t<iframe src="https://www.scribd.com/embeds/$2/content" frameborder="0" scrolling="no"></iframe>\n' +
                    '\t</div>\n' +
                    '</div>\n'
        }
    );

    // Spreaker
    // https://developers.spreaker.com/

    Embedify.site(
        'spreaker',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:\w+.|)(?:spreaker\.com\/.*)(episode_id=\d+|show_id=\d+|user_id=\d+|episode\/.+|show\/.+|user\/.+).*/gi,
            html: '<div class="embedify-embed spreaker">' +
                    '\t<iframe src="https://widget.spreaker.com/player?$1&autoplay=false&playlist=false&theme=dark" style="width: 100%; height: 131px;" frameborder="0" scrolling="no"></iframe>\n' +
                    '</div>\n',
            process: function( html ) {
                var regexId = /(episode|show|user)\/[\w-]*\b(\d+)/gi;
                var parsedId = regexId.exec( html );

                if( parsedId != undefined ) {
                    var formattedId = parsedId[1] + '_id=' + parsedId[2];
                    html = html.replace( regexId, formattedId );
                }

                return html;
            }
        }
    );

    // Storify
    // http://dev.storify.com/api/

    Embedify.site(
        'storify',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:storify\.com\/)(\w*)\/([\w-]+).*/gi,
            html: '<div class="embedify-embed storify">' +
                    '\t<iframe src="https://storify.com/$1/$2/embed?header=false&border=false" width="100%" height=750 frameborder=no allowtransparency=true></iframe>\n' +
                    '\t<script src="https://storify.com/$1/$2.js?header=false&border=false"></script>\n' +
                    '</div>\n'
        }
    );

    // Streamable
    // https://streamable.com/documentation

    Embedify.site(
        'streamable',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:streamable\.com\/(?:\w+\/)?)(\w+).*/gi,
            html: '<div class="embedify-embed embedify-responsive-container">' +
                    '\t<iframe src="https://streamable.com/e/$1" frameborder="0" onload="Embedify.scaleToFit( this );" width="640" height="360" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
                    '</div>\n',
            isFallback: true
        }
    );

    // Tenor
    // https://developers.google.com/tenor/guides/quickstart

    Embedify.site(
        'tenor',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:tenor\.com\/(?:view\/[\w-]+-|embed\/))(\d+).*/gi,
            html: '<div class="embedify-embed embedify-responsive-container">' +
                    '\t<iframe src="https://tenor.com/embed/$1" frameborder="0" onload="Embedify.scaleToFit( this );" width="640" height="360" allowFullScreen></iframe>\n' +
                    '</div>\n'
        }
    );

    // Twitter Tweet
    // https://dev.twitter.com/docs/embedded-tweets

    Embedify.site(
        'twitter-tweet',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:twitter\.com|x\.com)\/([\w_]+)\/([\w_]+)\/(\d+).*/gi,
            html: '<blockquote class="embedify-embed twitter-tweet" align="center" lang="en" data-conversation="none">' +
                    '\t<a href="https://twitter.com/$1/$2/$3">https://twitter.com/$1/$2/$3</a>\n' +
                    '</blockquote>\n'
        }
    );

    // Vimeo
    // https://developer.vimeo.com/player/embedding

    Embedify.site(
        'vimeo',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:(?:player\.)?vimeo\.com\/(?:\w*\/)*)(\d+).*/gi,
            html: '<div class="embedify-embed embedify-responsive-container">' +
                    '\t<iframe src="https://player.vimeo.com/video/$1" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
                    '</div>\n'
        }
    );

    // Vine
    // http://blog.vine.co/post/55514921892/embed-vine-posts

    Embedify.site(
        'vine',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:vine\.co)\/v\/([\w]+).*/gi,
            html: '<div class="embedify-embed embedify-responsive-container" style="padding-bottom: 100%;">' +
                    '\t<iframe class="vine-embed" src="https://vine.co/v/$1/embed/simple?related=0" width="100%" frameborder="0"></iframe>' +
                    '\t<script async src="https://platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>' +
                    '</div>\n'
        }
    );

    // Youtube
    // https://developers.google.com/youtube/player_parameters

    Embedify.site(
        'youtube',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{11})(?:[?&](?!t=|start=|end=)(?:\w+=)[\w;:@#%\+\/\$\.\-]*)*(?:[?&]t=((?:\d+h)?(?:\d+m)?(?:\d+s)?(?:\d+)?))?(?:[?&]start=(\d+))?(?:[?&]end=(\d+))?.*/gi,
            html: '<div class="embedify-embed embedify-responsive-container">' +
                    '\t<iframe src="https://www.youtube.com/embed/$1?t=$2&start=$3&end=$4" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
                    '</div>\n',
            process: function( html ) {
                var regexTime = /\?t=((?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+))?)&start=(\d+)?&end=(\d+)?/gi;
                var parsedTime = regexTime.exec( html );
                var startSeconds = 0;
                var endSeconds = '';
                if( typeof parsedTime !== 'undefined' ) {
                    if( typeof parsedTime[2] !== 'undefined' )
                        startSeconds += 3600 * parseInt( parsedTime[2] );
                    if( typeof parsedTime[3] !== 'undefined' )
                        startSeconds += 60 * parseInt( parsedTime[3] );
                    if( typeof parsedTime[4] !== 'undefined' )
                        startSeconds += parseInt( parsedTime[4] );
                    if( typeof parsedTime[5] !== 'undefined' )
                        startSeconds += parseInt( parsedTime[5] );
                    if( typeof parsedTime[6] !== 'undefined' )
                        startSeconds = parseInt( parsedTime[6] );
                    if( typeof parsedTime[7] !== 'undefined' )
                        endSeconds = parseInt( parsedTime[7] );
                }

                if( startSeconds > 0 || endSeconds !== '' ){
                    html = html.replace( regexTime, "?rel=0&start="+startSeconds+"&end="+endSeconds );
                } else {
                    html = html.replace( regexTime, "" );
                }

                return html;
            }
        }
    );


})(window, window.document, window.Embedify);
