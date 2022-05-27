function processSuccess(response, callback, $form) {
    // console.log(response)
    if ($form.attr('id') && response.result === 'success') {
        yaCounter.reachGoal($form.attr('id'));
        gtag('event', $form.attr('id'));
    }
    if (callback) {
        callback({clearForm: response.result === 'success', unlockSubmitButton: true});
    }
    var delay = 1500;
    if (response.delay) {
        delay = response.delay;
    }
    if (response.text) {
        Popup.message(response.text);
    }
    if (response.errors) {
        $.each(response.errors, function (i, el) {
            if (i === '__all__') {
                ValidateForm.customFormErrorTip($form[0], el[0]);
            } else {
                ValidateForm.customErrorTip($form.find('[name=' + i + ']').get(0), el[0]);
            }
        });
    }
    if (response.redirect_to) {
        setTimeout(function () {
            if (response.redirect_to == 'self') {
                window.location.reload();
            } else {
                window.location.href = response.redirect_to;
            }
        }, delay);
    }
}

function processError(callback) {
    if (callback){
        callback({clearForm: false, unlockSubmitButton: true});
    }
    Popup.message('Возникла ошибка. Попробуйте позже.');
}

document.addEventListener('DOMContentLoaded', function () {
    // popup
    Popup.init('.js-open-popup');

    // mobile nav
    MobNav.init({
        openBtn: '.js-open-menu',
        closeBtn: '.js-close-menu',
        headerId: 'header',
        closeLink: 'a.js-anchor'
    });

   
    // form
    Form.init('.form');

    Form.onSubmit = function (form, callback) {

        // var files = CustomFile.files(form);
        var dt = new FormData(form);
        // $.each(files, function (i, el) {
        //     dt.append('avatar', el, el.filename)
        // })
        var _popup_id = $(form).parents('.popup__window').attr('id');
        $.ajax({
            url: form.action,
            type: "POST",
            dataType: "json",
            cache: false,
            contentType: false,
            processData: false,
            data: dt,
            success: function (response) {
                processSuccess(response, callback, $(form));
                if (response.errors) {
                    // open last popup
                    if (_popup_id) {
                        Popup.open('#' + _popup_id);
                    }
                }

            },
            error: function () {
                processError(callback);
            }
        });

        // <- ajax response

        return false;
    };

    try {
        Anchor.init('.js-anchor', 800, 100);
    } catch (error) {
        console.log(error);
    }

    $('input[data-type="tel"]').each(function () {
        new Maskinput(this, 'tel');
    });

});

function num_word(value, words) {
    value = Math.abs(value) % 100;
    var num = value % 10;
    if (value > 10 && value < 20) return words[2];
    if (num > 1 && num < 5) return words[1];
    if (num == 1) return words[0];
    return words[2];
}

function refreshCounterGoods() {
    var goodsLength = $('.basket__item').length
    $('.js-counter-goods').text(goodsLength + num_word(goodsLength, [' товар в корзине', ' товара в корзине', ' товаров в корзине']))
}

function toggleAnimation() {
   
} 


$(function() {
    // HEADERMODE
    var header = $('.header')
    var dropdownMenu = $('.dropdown__menu')
    $('#introduce').length ? header.addClass('header--lightmode') : header.addClass('header--darkmode') 

    $('body')
        .on('click', '.header__row', function(event){
            if (event.target.classList.contains('header__nav') || event.target.closest('.header__nav')) {
                return
            } else {
                console.log('er');
                $('.js-open-menu').click()
            }
        })
        .on('click', '.js-counter-link', function(event) {
            event.preventDefault()

            var _this = $(this)
            var _dataCounter = _this.data('counter')
            var cardNum = _this.siblings('.card__num')
            var numBottle = cardNum.find('.js-count-bottle').text()
            var presentBottle
            numBottle >= 10 ? presentBottle = 1 : presentBottle = 0

            if (_dataCounter === 'plus') {
                numBottle++
            } else {
                if( numBottle == 0 ) {
                    return
                } else {
                    numBottle--
                }
            }
            if (cardNum.hasClass('basket__item-num')) {
                cardNum.html(`<span class="js-count-bottle">${numBottle}</span>` + '<br>' + num_word(numBottle, [' бутылка', " бутылки", " бутылок"])) 
            } else {
                cardNum.html(`<span class="js-count-bottle">${numBottle}</span>` + ' ' + num_word(numBottle, [' бутылка', " бутылки", " бутылок"]) + '<span>+ ' + `${presentBottle}` + num_word(presentBottle, [' бутылка', " бутылки", " бутылок"]) + '</span>') 
            }
        })
        .on('click', '.choice__tab', function(event) {
            event.preventDefault()
            var _this = $(this)
            var _tabs = $('.choice__tab')

            if (_this.hasClass('active')) {
                return
            } else {
                _tabs.removeClass('active')
                _this.addClass('active')
            }
        })
        .on('click', '.basket__item-delete', function(event) {
            event.preventDefault()
            var _this = $(this)
            var _item = _this.parents('.basket__item')
            _item.remove()

            if (!$('.basket__item').length) {
                $('.basket__leftside').html(`<p class="basket__item-name">Ваша корзина пуста</p>`)
            }

            refreshCounterGoods()
        })
        .on('mouseenter', '.dropdown__menu', function() {
            var _this = $(this)
            _this.addClass('opened')
        })
        .on('mouseleave', '.dropdown__menu', function() {
            var _this = $(this)
            _this.removeClass('opened')
        })
        .on('click', '.js-option', function() {
            var _this = $(this)
            var _dataText = _this.data('value')
            var _sortSelect = $('.js-sort-span')
            _sortSelect.text(_dataText)
            dropdownMenu.removeClass('opened')
        })

    // ===== MAP
    ymaps.ready(mapInit);
    function mapInit(){
        var myMap = new ymaps.Map("map", {
            center: [55.76, 37.64],
            zoom: 7,
            controls: []
        });
        myMap.behaviors.disable('scrollZoom');
    }

    // ===== POPUP MAP
    ymaps.ready(popupMapInit);
    function popupMapInit(){
        var input = $('#adress')
        var myPlacemark
        var popupMap = new ymaps.Map("popup-map", {
            center: [55.76, 37.64],
            zoom: 7,
            controls: ['searchControl']
        });

        var searchControl = popupMap.controls.get('searchControl');
        searchControl.events.add('submit', function () {
            input.val( searchControl.getRequestString())
        }, this);

        searchControl.events.add('resultselect', function(e) {
            var index = e.get('index');
            searchControl.getResult(index).then(function(res) {
                var coords = res.geometry.getCoordinates()
                if (myPlacemark) {
                    myPlacemark.geometry.setCoordinates(coords);
                }
                else {
                    myPlacemark = createPlacemark(coords);
                    popupMap.geoObjects.add(myPlacemark);
                    myPlacemark.events.add('dragend', function () {
                        getAddress(myPlacemark.geometry.getCoordinates());
                    });
                }
                getAddress(coords);     
                searchControl.clear();
            });
          })


        popupMap.events.add('click', function (e) {
            var coords = e.get('coords');

            if (myPlacemark) {
                myPlacemark.geometry.setCoordinates(coords);
            }
            else {
                myPlacemark = createPlacemark(coords);
                popupMap.geoObjects.add(myPlacemark);
                myPlacemark.events.add('dragend', function () {
                    getAddress(myPlacemark.geometry.getCoordinates());
                });
            }
            getAddress(coords);
        });

        function createPlacemark(coords) {
            return new ymaps.Placemark(coords, {
                iconCaption: 'поиск...'
            }, {
                preset: 'islands#violetDotIconWithCaption',
                draggable: true
            });
        }

        function getAddress(coords) {
            myPlacemark.properties.set('iconCaption', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);

                myPlacemark.properties
                    .set({
                        iconCaption: [
                            // Название населенного пункта или вышестоящее административно-территориальное образование.
                            firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                        ].filter(Boolean).join(', '),
                        balloonContent: firstGeoObject.getAddressLine()
                    });
                    input.val(firstGeoObject.getAddressLine())
            });
        }
    }  

    // ===== SLIDER
    if ($('#additionally-slider').length) {
        $('#additionally-slider').slick({
            dots: false,
            arrows: true,
            slidesToShow: 3,
            slidesToScroll: 3,
            variableWidth: true,
            adaptiveHeight: true,
            responsive: [
                {
                  breakpoint: 800,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                  }
                },
                {
                    breakpoint: 450,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                    }
                }
            ]
        })
    }
  
    // ===== TIMEMASK
    $('input[data-type="time"]').inputmask({"regex": "^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"});

    // ===== DATEPICKER
    $('input[data-type="date"]')
            .on('keyup keydown', function (event) {
                if (event.key === 'Enter') {
                    event.stopImmediatePropagation()
                    event.stopPropagation()
                    event.preventDefault()
                    $('.datepick-cmd.datepick-cmd-close ').click() 
                }
            })
            .inputmask({ 
                'mask': '99.99.9999',
            })
            .datepick({
                monthsToShow: 1,
                minDate: 0,
                changeMonth: false,
                showOtherMonths: true,
                selectOtherMonths: true
            });

    // ===== COOLERPAGE
    if ($('#coolers').length) {
        var hash = location.hash
        var _filters = $('.filter__checkboxes')
        var _inputs = _filters.find('.custom-checkbox__input')
        var _productCard = $('.product__card')
        var activeFilters = []
        var _minPrice = 0
        var _maxPrice = 10000

        function refreshProduct() {
            if (activeFilters.length > 0) {
                _productCard.each(function (idx, elem) {
                    var _data = elem.dataset.filter
                    $(elem).fadeOut(100)
                    if (activeFilters.includes(_data)) {
                        $(elem).fadeIn(100)
                    }
                })
            } else {
                _productCard.fadeIn(100)
            }
            console.log(_minPrice);
            console.log(_maxPrice);
        }

        $('body').on('click', '.js-tabs-link', function(event) {
            var _this = $(this)
            var _thisData = _this.data('tab')
            var productBlock = $('.product')
            var tabs = $('.js-tabs-link')

            if (_this.hasClass('active')) {
                return
            } else {
                _filters.hide()
                productBlock.hide()
                tabs.removeClass('active')
                _this.addClass('active')
                $('.filter__checkboxes[data-products="'+ _thisData +'"]').fadeIn(200).css({'display':'grid'})
                $('.product[data-products="'+ _thisData +'"]').fadeIn(200).css({'display':'grid'})
            }
        })

        if (hash === '' || hash === '#coolers') {
            $('.js-tabs-link')[0].click()
        } else {
            $('.js-tabs-link')[1].click()
        }

        $("#price-range").ionRangeSlider({
            type: "double",
            min: 0,
            max: 10000,
            from: 0,
            to: 10000,
            postfix: '&nbsp;₽',
            onFinish: function(data) {
                _minPrice = data.from
                _maxPrice = data.to
                refreshProduct()
            },
            onUpdate: function (data) {
                _minPrice = data.min
                _maxPrice = data.max         
            }
        });
        var _range = $("#price-range").data("ionRangeSlider");

        $('body')
            .on('click', '.js-show-filter', function(event) {
                event.preventDefault()
                var _this = $(this)
                var _filters = $('.filter__bottom')
                var _rangeWrap = $(".filter__bottom-left")

                if (_this.hasClass('visible')) {
                    _this.removeClass('visible')
                    _filters.slideUp(200)
                    _rangeWrap.css({'opacity':'0'})
                } else {
                    _this.addClass('visible')
                    _filters.slideDown(200).css({'display':'flex'})
                    setTimeout(function(){_rangeWrap.css({'opacity':'1'})},250)
                }
            })
            .on('click', '.js-reset-filter, .js-tabs-link', function(event) {
                event.preventDefault()
                _inputs.each(function(idx, elem) {
                    if ($(elem).is(':checked')) {
                        $(elem).siblings('label').click()
                        activeFilters = []
                        refreshProduct()
                    }
                    _range.update({
                        from: 0,
                        to: 10000
                    });
                })
            })
            .on('click', '.filter__checkboxes label', function (event) {
                var _this = $(this)
                var _data = _this.data('filter')
                if (_this.hasClass('selected')) {
                    _this.removeClass('selected')
                    activeFilters = activeFilters.filter((el) => {return el != _data})
                } else {
                    _this.addClass('selected')
                    activeFilters.push(_data)
                }
                refreshProduct()                    
            })
            
    }

    // ===== ACCOUNTPAGE
    if ($('#account').length) {
        var hash = location.hash
        $('body').on('click', '.js-tabs-link', function(event) {
            var _this = $(this)
            var _thisData = _this.data('tab')
            var accountWrap = $('.account__wrap')
            var tabs = $('.js-tabs-link')

            if (_this.hasClass('active')) {
                return
            } else {
                accountWrap.hide()
                tabs.removeClass('active')
                _this.addClass('active')
                $('.account__wrap[data-account="'+ _thisData +'"]').fadeIn(200).css({'display':'flex'})
            }
        })

        if (hash === '' || hash === '#details') {
            $('.js-tabs-link')[0].click()
        } else {
            $('.js-tabs-link')[1].click()
        }

        $('body')
            .on('click', '.js-show-more', function (event) {
                event.preventDefault()
                var _this = $(this)
                var _path = _this.data('src')
                var _block = $('.account__wrap .wrap')
                _this.attr('disabled', 'disabled')
                
                $.get(_path, function (data) {
                    var svgEl = $(data);
                    _this.empty().append(svgEl)
                }, 'text')
        
        
                // for delete!
                setTimeout(function () {
                    var newHTML = _block.html()
                    _block.html(_block.html() + newHTML)
                    _this.empty().text('Показать еще')
                    _this.removeAttr('disabled')
                }, 1500)
            })
            .on('click', '.js-change-info', function(event) {
                event.preventDefault()
                var _this = $(this)
                var _btn = _this.siblings('.btn')
                var _inputs = _this.parents('.form').find('.form__text-input')

                _this.addClass('btn--hidden')
                _btn.removeClass('btn--hidden')
                _inputs.each(function(idx, elem) {
                    $(elem).attr('disabled', false)
                })
            })
    }

    // ===== ARTICLESPAGE
    if ($('#articles').length) {
        $('body').on('click', '.js-show-more', function (event) {
            event.preventDefault()
            var _this = $(this)
            var _path = _this.data('src')
            var _block = $('.articles__wrap')
            _this.attr('disabled', 'disabled')
            
            $.get(_path, function (data) {
                var svgEl = $(data);
                _this.empty().append(svgEl)
            }, 'text')
    
    
            // for delete!
            setTimeout(function () {
                var newHTML = _block.html()
                _block.html(_block.html() + newHTML)
                _this.empty().text('Показать еще')
                _this.removeAttr('disabled')
            }, 1500)
        })
    }

    // ===== ORDERPAGE
    if ($('#order').length) {
        $('body').on('click', '.js-toggleLink', function(event) {
            event.preventDefault()
            var _this = $(this)
            var choiceHeader = _this.parents('.basket__choice-header')
            var chocieBody = choiceHeader.siblings('.basket__choice-body')

            if (_this.hasClass('visible')) {
                _this.removeClass('visible')
                chocieBody.slideUp(200)
            } else {
                _this.addClass('visible')
                chocieBody.slideDown(200)
            }
        })
    }

    // ===== FAQPAGE
    if ($('#faq').length) {
        $('body').on('click', '.js-toggleLink', function(event) {
            event.preventDefault()
            var _this = $(this)
            var _itemBody = _this.find('.faq__item-body')
            var _allLink = $('.js-toggleLink')
            var _allBoby = _allLink.find('.faq__item-body')


            if (_this.hasClass('visible')) {
                _this.removeClass('visible')
                _itemBody.slideUp(200)
            } else {
                _allLink.removeClass('visible')
                _allBoby.slideUp(200)
                _this.addClass('visible')
                _itemBody.slideDown(200)
            }
        })
    }

    // STARTPAGE
    if ($('#introduce').length) {
        var balanceTop = $('#balance').offset().top 
        var balanceHeight = $('#balance').height()
        var animatedBlock = $('.balance__image-bg')
        var animateBlock = $('.animated')

        var mobileOption = {
            mobileFirst: true,
            arrows: true,
            dots: false,
            infinite: true,
            slidesToScroll: 1,
            slidesToShow: 1,
            fade: true, 
        
        }

        var tabletOptions = {
            dots: false,
            arrows: true,
            infinite: true,
            slidesToScroll: 1,
            variableWidth: true,
            mobileFirst: true,
            responsive: [
            {
                breakpoint: 1200,
                slidesToShow: 3,
            },
            {
                breakpoint: 800,
                slidesToShow: 2,
            },
            {
                breakpoint: 450,
                variableWidth: false,
                fade: true,
                slidesToShow: 1,
            }]
        }      

        function addAnimatClass() {
            animateBlock.each( function(idx, elem) {
                var _parent = $(elem).parents('section')
                var _top = _parent.offset().top
                if (pageYOffset >= _top - innerHeight) {
                    $(elem).addClass('fadeInUp')
                    
                }
            })
        }

        addAnimatClass()
    
        if ( innerWidth < 1200 ) {
            $('.tabletSlider').slick(tabletOptions);
            animateBlock.removeClass('animated fadeInUp')
        }    
                
        if ( innerWidth < 800) {
            $('.mobileSlider-lg').slick(mobileOption);
        }

        if ( innerWidth < 450) {
            $('.mobileSlider-sm').slick(mobileOption);
        }
    
        $(window).on('resize', function() {
            if ( innerWidth > 1200) {
                $('.tabletSlider.slick-initialized').slick('unslick')
                animateBlock.addClass('animated')
                addAnimatClass()
            }
    
            if ( innerWidth < 1200) {
                $('.tabletSlider').not('.slick-initialized').slick(tabletOptions)
                animateBlock.removeClass('animated fadeInUp')
            }
    
            if ( innerWidth > 800) {
                $('.mobileSlider-lg.slick-initialized').slick('unslick')
            } 
    
            if ( innerWidth < 800) {
                $('.mobileSlider-lg').not('.slick-initialized').slick(mobileOption)
            }

            if ( innerWidth > 450) {
                $('.mobileSlider-sm.slick-initialized').slick('unslick')
            } 
    
            if ( innerWidth < 450) {
                $('.mobileSlider-sm').not('.slick-initialized').slick(mobileOption)
            }
        })

        $(window).on('scroll', function(event) {
            var offsetForStart = Math.floor(balanceTop - balanceHeight)
            if (pageYOffset > offsetForStart) {
                animatedBlock.each((idx, elem) => $(elem).addClass('animate'))
            }
            addAnimatClass()           
        })
    
    }

    // BASKETPAGE 
    if ($('#basket').length) {
        refreshCounterGoods()
    }


   
   $('body').addClass('visible')
})




