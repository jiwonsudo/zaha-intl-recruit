(function(){
  // 지원 기간이 열리면 true로 바꾸세요. 지원서 폼이 열리고 하단 안내 바도 사라져요.
  const APPLY_OPEN = false;

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

  const noticeBar = document.getElementById('noticeBar');
  const noticeClose = document.getElementById('noticeClose');
  if(noticeBar && !APPLY_OPEN){
    setTimeout(function(){ noticeBar.classList.add('show'); }, 400);
    if(noticeClose){
      noticeClose.addEventListener('click', function(){
        noticeBar.classList.remove('show');
      });
    }
  }

  const applyOpenBtn = document.getElementById('applyOpenBtn');
  const applyOverlay = document.getElementById('applyModalOverlay');
  const applyModalClose = document.getElementById('applyModalClose');
  const applyForm = document.getElementById('applyForm');
  const applyClosedWrap = document.getElementById('applyClosedWrap');
  const applyClosedCloseBtn = document.getElementById('applyClosedCloseBtn');
  const applyFormWrap = document.getElementById('applyFormWrap');
  const applySuccessWrap = document.getElementById('applySuccessWrap');
  const applySuccessCloseBtn = document.getElementById('applySuccessCloseBtn');
  const applySubmitBtn = document.getElementById('applySubmitBtn');
  const applyFormError = document.getElementById('applyFormError');

  document.querySelectorAll('.char-count').forEach(function(counter){
    const target = document.getElementById(counter.dataset.countFor);
    if(!target) return;
    const max = target.getAttribute('maxlength') || 300;
    const update = function(){
      counter.textContent = target.value.length + '/' + max;
    };
    update();
    target.addEventListener('input', update);
  });

  const confirmCheck = document.getElementById('f-confirm');
  if(confirmCheck && applySubmitBtn){
    confirmCheck.addEventListener('change', function(){
      applySubmitBtn.disabled = !confirmCheck.checked;
    });
  }

  const contactInput = document.getElementById('f-contact');
  const contactHint = document.getElementById('f-contact-hint');
  if(contactInput && contactHint){
    contactInput.addEventListener('input', function(){
      contactHint.hidden = contactInput.validity.valid || contactInput.value === '';
    });
    contactInput.addEventListener('blur', function(){
      contactHint.hidden = contactInput.validity.valid;
    });
  }

  const openApplyModal = function(){
    if(!applyOverlay) return;
    if(applyClosedWrap) applyClosedWrap.hidden = APPLY_OPEN;
    if(applyFormWrap) applyFormWrap.hidden = !APPLY_OPEN;
    if(applySuccessWrap) applySuccessWrap.hidden = true;
    applyOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  };
  const closeApplyModal = function(){
    if(!applyOverlay) return;
    applyOverlay.classList.remove('show');
    document.body.style.overflow = '';
  };

  if(applyOpenBtn){
    applyOpenBtn.addEventListener('click', openApplyModal);
  }
  if(applyModalClose){
    applyModalClose.addEventListener('click', closeApplyModal);
  }
  if(applyClosedCloseBtn){
    applyClosedCloseBtn.addEventListener('click', closeApplyModal);
  }
  if(applyOverlay){
    applyOverlay.addEventListener('click', function(e){
      if(e.target === applyOverlay) closeApplyModal();
    });
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && applyOverlay && applyOverlay.classList.contains('show')){
      closeApplyModal();
    }
  });
  if(applySuccessCloseBtn){
    applySuccessCloseBtn.addEventListener('click', closeApplyModal);
  }

  if(applyForm){
    applyForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(applyFormError) applyFormError.hidden = true;
      if(applySubmitBtn){
        applySubmitBtn.disabled = true;
        applySubmitBtn.textContent = '제출 중...';
      }
      fetch(applyForm.action, {
        method: 'POST',
        body: new FormData(applyForm),
        headers: { 'Accept': 'application/json' }
      }).then(function(res){
        if(res.ok){
          if(applyFormWrap) applyFormWrap.hidden = true;
          if(applySuccessWrap) applySuccessWrap.hidden = false;
          applyForm.reset();
        } else {
          throw new Error('submit failed');
        }
      }).catch(function(){
        if(applyFormError) applyFormError.hidden = false;
      }).finally(function(){
        if(applySubmitBtn){
          applySubmitBtn.disabled = !confirmCheck || !confirmCheck.checked;
          applySubmitBtn.textContent = '제출하기';
        }
      });
    });
  }
})();
