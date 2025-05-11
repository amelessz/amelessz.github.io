var posts=["2025/05/09/hello-world/","2025/05/10/数据管理模块/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };