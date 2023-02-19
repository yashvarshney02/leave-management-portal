import React from 'react'

export default function Footer() {
    return (
        <div>
            <footer>
                <div id="contact">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-6">
                                <div id="contact-left">
                                    <h3>Vesco</h3>
                                    <p>We believe in <strong> Simple</strong>, <strong>Clean</strong> and <strong>Modern</strong>
                                        Deign Standards with Responsive Approch. Browse the amazing work of company.</p>
                                    <div id="contact-info">
                                        <address>
                                            <strong>Headquarters</strong><br />
                                                <p>221 Jockey Hollow, Svite 600<br /> Smithdown, NY 11787</p>
                                        </address>
                                        <div id="phone-fax-email">
                                            <p><strong>Phone:</strong> <span>7814245626</span></p>
                                            <p><strong>Fax:</strong> <span>7814245626</span></p>
                                            <p><strong>Email:</strong> <span>jaglike.makkar@gmail.com</span></p>
                                        </div>
                                    </div>
                                    <ul class="social-list">
                                        <li><a href="#" class="social-icon icon-white"><i class="fa fa-facebook"></i></a></li>
                                        <li><a href="#" class="social-icon icon-white"><i class="fa fa-twitter"></i></a></li>
                                        <li><a href="#" class="social-icon icon-white"><i class="fa fa-youtube"></i></a></li>
                                        <li><a href="#" class="social-icon icon-white"><i class="fa fa-google-plus"></i></a>
                                        </li>
                                    </ul>

                                </div>
                            </div>
                            <div class="col-md-6">
                                <div id="contact-right">
                                    <h3>Contact Us</h3>
                                    <form action="#">
                                        <input type="text" name="full-name" placeholder="Full Name" class="form-control" />
                                            <input type="text" name="email" placeholder="Email Address" class="form-control" />
                                                <textarea rows="5" name="message" placeholder="Message..."
                                                    class="form-control"></textarea>

                                                <div id="send-btn">
                                                    <a class="btn btn-lg btn-general btn-white" href="#" role="button">Send</a>
                                                </div>
                                            </form>
                                        </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </footer>
        </div>
    )
}
