/*!
 * Embedify v0.1
 */
window.Embedify = (function(window, document, $, undefined)
{
    'use strict';

    var Embedify = {

        sites: { },

        load: function( selector )
        {
            $( selector ).each( function() {
                var url = $( this ).attr( 'href' );

                var match = Embedify.match( url );
                
                if( match !== '' ) {
                    Embedify.embed( url, match, $( this ).parent() );
                }
            } );
        },

        match: function( url ) {
            var match = '';
            $.each( Embedify.sites, function( name, site ) {
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
            Embedify.sites[name] = {
                'name': name,
                regex: params['regex'],
                html: params['html'],
                process: function( html ) {
                    return html;
                }
            };
            if( typeof params['process'] == 'function' ) {
                Embedify.sites[name]['process'] = params['process'];
            }
        }
    };

    return Embedify;

})(window, window.document, jQuery);

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
            html: '<a href="http://gfycat.com/$1" target="_blank">\n' +
                    '<video width="100%" autoplay loop poster="http://thumbs.gfycat.com/$1-poster.jpg" style="margin:auto;">\n' +
                    '\t<source src="http://zippy.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t<source src="http://fat.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t<source src="http://giant.gfycat.com/$1.webm" type="video/webm">\n' +
                    '\t<source src="http://fat.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '\t<source src="http://giant.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '\t<source src="http://zippy.gfycat.com/$1.mp4" type="video/mp4">\n' +
                    '</video>\n' +
                    '</a>\n'
        }
    );

    // Instagram
    // http://instagram.com/developer/

    Embedify.site( 
        'instagram', 
        {
            regex: /(?:http:|https:|)(?:\/\/|)(?:www\.|)(?:instagr\.am|instagram\.com)\/p\/([\w-]+)\/.*/gi,
            html: '<div style="max-width: 612px; max-height: 710px; margin: auto;">' +
                    '\t<div class="embedify-responsive-container" style="padding-bottom: 100%; height: 114px;">\n' +
                    '\t<iframe src="//instagram.com/p/$1/embed/" frameborder="0" scrolling="no" allowtransparency="true"></iframe>\n' +
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
            html: '<div style="max-height: 600px; margin: auto;">' +
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
            html: '<div class="storify">' +
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
            html: '<blockquote class="twitter-tweet" align="center" lang="en">' +
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
            html: '<div class="embedify-responsive-container">' +
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
            html: '<div class="embedify-responsive-container" style="padding-bottom: 100%;">' +
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
            html: '<div class="embedify-responsive-container">' +
                    '\t<iframe src="//www.youtube.com/embed/$1?start=$2" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>\n' +
                    '</div>\n',
            process: function( html ) {
                var regexTime = /(?:start=((?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?))/gi;
                var parsedTime = regexTime.exec( html );
                console.log(parsedTime);
                var seconds = 0;
                if( typeof parsedTime[2] !== 'undefined' )
                    seconds += 3600 * parseInt( parsedTime[2] );
                if( typeof parsedTime[3] !== 'undefined' )
                    seconds += 60 * parseInt( parsedTime[3] );
                if( typeof parsedTime[4] !== 'undefined' )
                    seconds += parseInt( parsedTime[4] );

                html = html.replace( regexTime, "start="+seconds );
                console.log( html );

                return html;
            }
        }
    );
    
    
})(window, window.document, window.Embedify);

