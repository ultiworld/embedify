<?php
/**
 * Plugin Name: Embedify
 * Plugin URI: http://ultiworld.com
 * Description: Asynchronously load embeddable media
 * Version: 1.74
 * Author: Orion Burt
 * Author URI: http://orionburt.com
**/

define('EMBEDIFY_DEFAULT_ASPECT_WIDTH', 16);
define('EMBEDIFY_DEFAULT_ASPECT_HEIGHT', 9);

function embedify_enqueue_styles() {
	$aspect_ratio_percent = round( (float) EMBEDIFY_DEFAULT_ASPECT_HEIGHT / EMBEDIFY_DEFAULT_ASPECT_WIDTH * 100, 6 );
	$html = 	"\n<style>\n";
	$html .= 	".embedify-responsive-container { position: relative; padding-bottom: ".$aspect_ratio_percent."%; height: 0; overflow: hidden; max-width: 100%; height: auto; }\n";
	$html .=	".embedify-responsive-container > * { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }\n";
	$html .=	"</style>\n";

	echo $html;
}
add_action( 'wp_head', 'embedify_enqueue_styles', 5 );

function embedify_enqueue_scripts() {
	wp_register_script(
		'embedify-script',
		plugin_dir_url( __FILE__ ) . 'embedify.js',
		array( 'jquery' ),
		'1.74',
		false
	);
	wp_enqueue_script( 'embedify-script' );
}
add_action( 'wp_enqueue_scripts', 'embedify_enqueue_scripts' );

function embedify_activate() {

}

function embedify_deactivate() {

}

function embedify_uninstall() {
	
}

register_activation_hook( __FILE__, 'embedify_activate' );
register_activation_hook( __FILE__, 'embedify_deactivate' );
register_uninstall_hook( __FILE__, 'embedify_uninstall' );

?>
