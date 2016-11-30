import svelte from 'rollup-plugin-svelte';

export default {
    entry: 'src/main.js',
    dest: 'bundle.js',
    format: 'iife',
    plugins: [
        svelte({
            // By default, all .html and .svelte files are compiled


            // You can restrict which files are compiled
            // using `include` and `exclude`
            include: 'src/components/**.html'
        })
    ]
}