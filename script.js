(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = document.querySelector('header');
  if(header){
    const setHeaderHeight = function(){
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    };
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);
  }

  const fadeEls = document.querySelectorAll('.fade');
  if(reduceMotion || !('IntersectionObserver' in window)){
    fadeEls.forEach(function(el){ el.classList.add('in'); });
  } else {
    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    fadeEls.forEach(function(el){ io.observe(el); });
  }

  const statEl = document.getElementById('stat-count');
  if(statEl){
    const target = 39;
    let done = false;
    const animate = function(){
      if(done) return;
      done = true;
      if(reduceMotion){
        statEl.textContent = target;
        return;
      }
      const duration = 1500;
      let start = null;
      function step(ts){
        if(start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        if(progress < 1){
          statEl.textContent = (target * progress).toFixed(1);
          requestAnimationFrame(step);
        } else {
          statEl.textContent = target;
        }
      }
      requestAnimationFrame(step);
    };

    const statTarget = document.querySelector('.stat-block') || statEl;
    if('IntersectionObserver' in window){
      const statIo = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            animate();
            statIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6, rootMargin: '0px 0px -30% 0px' });
      statIo.observe(statTarget);
    } else {
      animate();
    }
  }
})();
