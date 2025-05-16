var posts=["2025/05/12/Oracle常见概念/","2025/05/15/水平触发和边缘触发/","2025/05/10/数据管理/","2025/05/15/阻塞和非阻塞IO/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };