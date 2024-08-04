document.addEventListener('DOMContentLoaded', function () {
  const client = contentful.createClient({
    space: 'vkuet8p2ux3r', // Replace with your Contentful space ID
    accessToken: 's20_dMSBkbxKL8M8jz9HGSnzg3OB0971DCuEl6y6xf4' // Replace with your Contentful access token
  });

  async function fetchAndDisplayPosts() {
    const blogPostsContainer = document.getElementById('blog-posts');

    try {
      const entries = await client.getEntries();
      blogPostsContainer.innerHTML = entries.items.map(entry => `
         <div class="blog-post w-full md:w-8/12 lg:w-6/12 xl:w-4/12">
             <div
                 class="single_blog mx-3 mt-8 rounded-xl bg-white transition-all duration-300 overflow-hidden hover:shadow-lg">
                 <div class="blog_image">
                     <img src=${entry.fields.image.fields.file.url} alt=${entry.fields.title} class="w-full">
                 </div>
                 <div class="blog_content p-4 md:p-5">
                     <ul class="blog_meta flex justify-between">
                         <li class="text-body-color text-sm md:text-base">
                         By:
                         <a href="#" class="text-body-color hover:text-theme-color">${entry.fields.author}</a></li>
                         <li class="text-body-color text-sm md:text-base">${new Date(entry.fields.publishDate).toLocaleDateString()}</li>
                     </ul>
                     <h3 class="blog_title">
                     <a href="blog-post-detail.html?id=${entry.sys.id}" class="text-body-color hover:text-theme-color">
                        ${entry.fields.tittle}</a></h3>
                     <a href="blog-post-detail.html?id=${entry.sys.id}" class="more_btn">Read More</a>
                 </div>
             </div> <!-- row -->
         </div>
       `).join('');
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  }

  fetchAndDisplayPosts()
});
