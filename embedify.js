/**
 * Embedify v1.21
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

                var url = $( this ).attr( 'href' );

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
             * http://codepen.io/herschel666/blog/scaling-iframes-css-transforms
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


})(window, window.document, window.Embedify);


/**
 * Embedify Extensions - Pick 'n' Mix!
 */
(function(window, document, Embedify, undefined)
{

    // Gfycat
    // http://www.gfycat.com/about
    // http://www.gfycat.com/api

    Embedify.site(
        'gfycat',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:gfycat\.com\/(?:\w+\/)*)(\w+).*/gi,
            html: '<div class="embedify-embed embedify-responsive-container js-hover-to-play">\n' +
                    '\t<video width="100%" loop poster="http://thumbs.gfycat.com/$1-poster.jpg" style="margin:auto;">\n' +
                    '\t\t<source src="http://zippy.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t\t<source src="http://fat.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t\t<source src="http://giant.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t\t<source src="http://fat.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '\t\t<source src="http://giant.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '\t\t<source src="http://zippy.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '\t</video>\n' +
                    '</div>\n'
        }
    );

    // Instagram
    // http://instagram.com/developer/

    Embedify.site(
        'instagram',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:instagr\.am|instagram\.com)\/p\/([\w-]+)\/.*/gi,
            html: '<div class="embedify-embed" style="max-width: 612px; max-height: 710px; margin: auto;">' +
                    '\t<div class="embedify-responsive-container" style="padding-bottom: 100%; height: 114px;">\n' +
                    '\t<iframe src="//instagram.com/p/$1/embed/" frameborder="0" scrolling="no" allowtransparency="true"></iframe>\n' +
                    '\t</div>\n' +
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
    // http://www.scribd.com/developers

    Embedify.site(
        'scribd',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:scribd\.com)\/(\w+)\/([\d-]+)\/.*/gi,
            html: '<div class="embedify-embed" style="max-height: 600px; margin: auto;">' +
                    '\t<div class="embedify-responsive-container" style="padding-bottom: 77.29%;">\n' +
                    '\t<iframe src="//www.scribd.com/embeds/$2/content" frameborder="0" scrolling="no"></iframe>\n' +
                    '\t</div>\n' +
                    '</div>\n'
        }
    );

    // Storify
    // http://dev.storify.com/api/

    Embedify.site(
        'storify',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:storify\.com\/)(\w*)\/([\w-]+).*/gi,
            html: '<div class="embedify-embed storify">' +
                    '\t<iframe src="//storify.com/$1/$2/embed?header=false&border=false" width="100%" height=750 frameborder=no allowtransparency=true></iframe>\n' +
                    '\t<script src="//storify.com/$1/$2.js?header=false&border=false"></script>\n' +
                    '</div>\n'
        }
    );

    // Twitter Tweet
    // https://dev.twitter.com/docs/embedded-tweets

    Embedify.site(
        'twitter-tweet',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:twitter\.com)\/([\w_]+)\/([\w_]+)\/(\d+).*/gi,
            html: '<blockquote class="embedify-embed twitter-tweet" align="center" lang="en" data-conversation="none">' +
                    '\t<a href="https://twitter.com/$1/$2/$3">https://twitter.com/$1/$2/$3</a>\n' +
                    '</blockquote>\n'
        }
    );

    // Vimeo
    // http://developer.vimeo.com/player/embedding

    Embedify.site(
        'vimeo',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:(?:player\.)?vimeo\.com\/(?:\w*\/)*)(\d+).*/gi,
            html: '<div class="embedify-embed embedify-responsive-container">' +
                    '\t<iframe src="//player.vimeo.com/video/$1" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
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
                    '\t<script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>' +
                    '</div>\n'
        }
    );

    // Youtube
    // https://developers.google.com/youtube/player_parameters

    Embedify.site(
        'youtube',
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{11})(?:[?&](?:t=((\d+h)?(\d+m)?(\d+s)?))|[?&][\w;:@#%=+\/\$_.-]*)*.*/gi,
            html: '<div class="embedify-embed embedify-responsive-container">' +
                    '\t<iframe src="//www.youtube.com/embed/$1?start=$2" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
                    '</div>\n',
            process: function( html ) {
                var regexTime = /(?:start=((?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?))/gi;
                var parsedTime = regexTime.exec( html );
                var seconds = 0;
                if( typeof parsedTime[2] !== 'undefined' )
                    seconds += 3600 * parseInt( parsedTime[2] );
                if( typeof parsedTime[3] !== 'undefined' )
                    seconds += 60 * parseInt( parsedTime[3] );
                if( typeof parsedTime[4] !== 'undefined' )
                    seconds += parseInt( parsedTime[4] );

                html = html.replace( regexTime, "start="+seconds );

                return html;
            }
        }
    );


})(window, window.document, window.Embedify);
